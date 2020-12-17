// Load local `.env` file.
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(bodyParser
    .urlencoded({ extended: true }));

const hasProperty = require('lodash/has');
const { existsSync } = require('fs');
const { join } = require('path');
const { promisify } = require('util');

const { server, formats } = require('./modules/config');

const {
    actionParser,
    normalizeString,
    serveBufferImage,
    serveImage,
    buildSharpObject,
    redisClient,
} = require('./modules/helpers');

// Path helper object.
const localRootPath = join(__dirname, '..');
const localPaths = {
    root: localRootPath,
    files: join(localRootPath, 'files'),
    images: {
        input: join(localRootPath, 'files', 'input', 'images'),
        output: join(localRootPath, 'files', 'output', 'images'),
    },
    videos: {
        input: join(localRootPath, 'files', 'input', 'videos'),
        output: join(localRootPath, 'files', 'output', 'videos'),
    },
};

app.post('/purge', async (req, res, next) => {

    if (!hasProperty(req, 'headers.x-purge-secret')) {
        return next(`'x-purge-secret' header is missing`);
    } else {
        if (req.headers['x-purge-secret'] !== process.env.PURGE_SECRET) {
            return next(`'x-purge-secret' not valid`);
        }
    }

    if (!hasProperty(req, 'body.action')) {
        return next(`'action' body parameter missing but required`);
    } else {
        if (![
            'all',
            'all-images',
            'all-videos',
        ].includes(req.body.action)) {
            return next(`action '${req.body.action}' not supported`);
        }
    }

    const rimraf = await promisify(require('rimraf'));

    let supportedFormats = [...(formats.video || []), ...(formats.image || [])];
    if (req.body.action !== 'all'
        && hasProperty(req, 'body.formats')) {
        if (Object.prototype.toString.call(req.body.formats) !== '[object Array]') {
            return next(`formats is not an array`);
        }
        supportedFormats = (req.body.formats)
            .filter(format => supportedFormats.includes(format));
    }

    if (!supportedFormats.length) {
        return next(`no supported formats found`);
    }

    let globPath;
    try {
        if (req.body.action === 'all') {
            globPath = join(localPaths.files, 'output', `**/*.{${supportedFormats}}`);
        } else if (req.body.action === 'all-images') {
            globPath = join(localPaths.images.output, `*.{${supportedFormats}}`);
        } else if (req.body.action === 'all-videos') {
            globPath = join(localPaths.videos.output, `*.{${supportedFormats}}`);
        }
        await rimraf(globPath);
    } catch (err) {
        return next(err);
    }

    res.send('purge done');
});

app.get('*', async (req, res, next) => {

    // URL path without query params.
    const urlPath = req.path;

    // NARF!!!
    if (urlPath === '/favicon.ico') {
        return res.sendStatus(200);
    }

    // GET query params.
    const queryParams = req.query;

    /**
     * Parse the URL path and pass the info to `parserInfo`.
     */
    let parserInfo = {};
    try {
        parserInfo = actionParser(urlPath, queryParams);
    } catch (err) {
        return next(err);
    }

    const {
        type,
        source,
        actions,
        file,
    } = parserInfo;

    try {
        const keyName = normalizeString(file.name,  actions.string);
        const localFilePath = join(localPaths.images.input, file.full);
        const localKeyFilePath = join(localPaths.images.output, keyName + '.' + file.extension);

        if (type === 'image') {

            let applyActions = false;

            const sourceFileFormat = hasProperty(actions, 'object.convertFrom')
                ? actions.object.convertFrom
                : null;

            if (source === 'redis') {
                if (redisClient === null) {
                    return next(`Redis connection not available`);
                }

                const cacheItem = await redisClient.get(keyName);
                if (cacheItem !== null) {
                    return serveBufferImage(
                        res,
                        cacheItem,
                        file.extension
                    );
                } else {
                    applyActions = true;
                }
            } else if (source === 'fs') {
                if (existsSync(localKeyFilePath)) {
                    return res
                        .sendFile(localKeyFilePath);
                } else {
                    applyActions = true;
                }
            } else if (source === 'raw') {
                return res
                    .sendFile(localFilePath);
            }

            if (!applyActions
                && source !== 'preview') {
                return next(`image '${file.full}' not found`);
            }

            const pImage = buildSharpObject({
                actions,
                file,
                localPaths,
                sourceFileFormat,
            });

            if (source !== 'preview') {
                if (source === 'fs') {

                    await pImage
                        .toFile(localKeyFilePath);

                    return res
                        .sendFile(localKeyFilePath);

                } else if (source === 'redis') {

                    await redisClient
                        .set(
                            keyName,
                            pImage
                                .toBuffer()
                                .toString('binary')
                        );

                    return serveBufferImage(
                        res,
                        pImage.toBuffer(),
                        file.extension
                    );
                }
            }

            return serveImage(
                res,
                await pImage,
                file.extension
            );

        } else if (parserInfo.type === 'video') {
            return res.send('videos are not supported yet');
        }
    } catch (err) {
        return next(err);
    }

    res.send('the end');
});

app.listen(server.port, () => {
    console.log(`API is up and running on port ${server.port}!`, '\n');
});
