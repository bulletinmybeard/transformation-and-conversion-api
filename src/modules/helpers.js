const hasProperty = require('lodash/has');
const { join } = require('path');
const sharp = require('sharp');

const { projects } = require('./config');
const regexRules = require('./regex');
const redisClient = require('./redis');

const helpers = {
    redisClient,
    regExp: ({
        action,
        regex,
        mode = 'test',
        flags = 'i',
        returnFullMatch = false,
    }) => {

        let matches = ([] | null);

        switch (mode) {
            case 'test':
                return new RegExp(regex, flags).test(`${action}`);
            case 'replace':
                return action.replace(new RegExp(regex, 'g'), '_');
            case 'match':
                matches = action.match(new RegExp(regex, flags));

                if (matches !== null) {

                    if (matches.length === 1
                        && matches[0] === action) {
                        return action;
                    }

                    if (returnFullMatch) {
                        return matches;
                    }

                    if (helpers.regExpTest(matches[1], '^([\\d]+)$')) {
                        return parseInt(matches[1]);
                    } else {
                        return matches[1];
                    }
                }
                break;
        }
    },
    regExpTest: (action, regex, flags) => {
        return helpers.regExp({
            action,
            regex,
            mode: 'test',
            flags,
        });
    },
    regExpMatch: (action, regex, returnFullMatch, flags) => {
        return helpers.regExp({
            action,
            regex,
            mode: 'match',
            flags,
            returnFullMatch,
        });
    },
    normalizeString: (value) => {
        return value.replace(new RegExp('[^a-zA-Z0-9]+', 'g'), '_');
    },
    actionParser: (urlPath) => {

        /**
         * Extract the `project`, `type`, `actions`,
         * and file information from the URL.
         */
        const regexMatches = helpers
            .regExpMatch(urlPath, regexRules.baseUrl, true);

        /**
         * The URLL path has to match the `baseUrl` regex pattern.
         */
        if (regexMatches === null
            || typeof regexMatches === 'undefined') {
            throw Error(`urlPath doesn't match the regex pattern.`);
        }

        let source = 'raw';
        let project;
        let type;
        let actions;
        let fileName;
        let fileExtension;

        if (typeof regexMatches[3] === 'undefined') {
            ([
                ,
                project,
                type,
                ,
                actions,
                fileName,
                fileExtension
            ] = regexMatches);
        } else {
            ([
                ,
                project,
                type,
                source,
                actions,
                fileName,
                fileExtension
            ] = regexMatches);
        }

        let actionObject = {};

        /**
         * To keep the length of regular expressions short,
         * we split the actions and check all actions
         * separated from each other.
         */
        actions
            .split(',')
            .map(t => t.trim())
            .forEach((action) => {

                const singleAction = helpers.regExpMatch(action, regexRules.singleActions);
                if (typeof singleAction !== 'undefined') {
                    actionObject[singleAction] = {};
                }

                const linear = helpers.regExpMatch(action, regexRules.linear, true);
                if (typeof linear !== 'undefined') {
                    const [, multiplier, offset] = linear
                            .map(val => (typeof val !== 'undefined')
                                ? parseFloat(val)
                                : undefined);
                    actionObject.linear = { multiplier, offset };
                }

                const median = helpers.regExpMatch(action, regexRules.median, true);
                if (typeof median !== 'undefined') {
                    const [, size] = median;
                    actionObject.median = (typeof size !== 'undefined')
                        ? parseFloat(size)
                        : undefined;
                }

                const rotate = helpers.regExpMatch(action, regexRules.rotate);
                if (typeof rotate !== 'undefined') {
                    actionObject.rotate = parseFloat(rotate);
                }

                const gamma = helpers.regExpMatch(action, regexRules.gamma);
                if (typeof gamma !== 'undefined') {
                    actionObject.gamma = parseFloat(gamma);
                }

                const blur = helpers.regExpMatch(action, regexRules.blur);
                if (typeof blur !== 'undefined') {
                    actionObject.blur = parseFloat(blur);
                }

                const height = helpers.regExpMatch(action, regexRules.height);
                if (typeof height !== 'undefined') {
                    actionObject.height = height;
                }

                const width = helpers.regExpMatch(action, regexRules.width);
                if (typeof width !== 'undefined') {
                    actionObject.width = width;
                }

                const cheight = helpers.regExpMatch(action, regexRules.cheight);
                if (typeof cheight !== 'undefined') {
                    actionObject.cheight = cheight;
                }

                const cwidth = helpers.regExpMatch(action, regexRules.cwidth);
                if (typeof cwidth !== 'undefined') {
                    actionObject.cwidth = cwidth;
                }

                const oleft = helpers.regExpMatch(action, regexRules.oleft);
                if (typeof oleft !== 'undefined') {
                    actionObject.oleft = oleft;
                }

                const otop = helpers.regExpMatch(action, regexRules.otop);
                if (typeof otop !== 'undefined') {
                    actionObject.otop = otop;
                }

                const resize = helpers.regExpMatch(action, regexRules.resize);
                if (typeof resize !== 'undefined') {
                    actionObject.resize = resize;
                }

                const gravity = helpers.regExpMatch(action, regexRules.gravity);
                if (typeof gravity !== 'undefined') {
                    actionObject.gravity = gravity;
                }

                const sharpen = helpers.regExpMatch(action, regexRules.sharpen, true);
                if (typeof sharpen !== 'undefined') {
                    const [, sigma, flat, jagged] = sharpen
                        .map(val => parseFloat(val));
                    actionObject.sharpen = { sigma, flat, jagged };
                }

                const position = helpers.regExpMatch(action, regexRules.position, true);
                if (typeof position !== 'undefined') {
                    const [, top, left, bottom, right] = position
                        .map(val => parseInt(val));
                    actionObject.position = { top, left, bottom, right };
                }

                const extend = helpers.regExpMatch(action, regexRules.extend);
                if (typeof extend !== 'undefined') {
                    const [top, left, bottom, right] = extend
                        .split('_')
                        .map(val => parseInt(val));
                    actionObject.extend = { top, left, bottom, right };
                }

                const background = helpers.regExpMatch(action, regexRules.background);
                if (typeof background !== 'undefined') {
                    const [r, g, b, alpha] = background
                        .split('_')
                        .map(val => parseFloat(val));
                    actionObject['background'] = { r, g, b, alpha };
                }

                const fit = helpers.regExpMatch(action, regexRules.fit);
                if (typeof fit !== 'undefined') {
                    actionObject['fit'] = fit;
                }

                const colour = helpers.regExpMatch(action, regexRules.colour);
                if (typeof colour !== 'undefined') {
                    actionObject['colour'] = colour;
                }

                const strategy = helpers.regExpMatch(action, regexRules.strategy);
                if (typeof strategy !== 'undefined') {
                    actionObject['strategy'] = strategy;
                }

                const quality = helpers.regExpMatch(action, regexRules.quality);
                if (typeof quality !== 'undefined') {
                    actionObject['quality'] = parseInt(quality);
                }
            });

        /**
         * Validate actions against their dependencies
         * as some action operations
         * require more actions to be present.
         */
        helpers
            .validateActionDependencies(actionObject);

        /**
         * Return everything we need to transform images
         * or convert videos.
         */
        return {
            project: projects[project],
            source,
            type,
            actions: {
                // object: Object.entries(actionObject)
                //     .sort()
                //     .reduce((o,[k, v]) => (o[k]=v, o), {}),
                object: actionObject,
                string: actions,
            },
            file: {
                full: fileName + '.' + fileExtension,
                name: fileName,
                extension: fileExtension,
            }
        };
    },
    validateActionDependencies: (actions) => {

        if (hasProperty(actions, 'resize')) {

            if (!hasProperty(actions, 'height')
                && !hasProperty(actions, 'width')) {
                throw Error(`action 'resize' requires at least 'height', 'width', or both.`);
            }

            if (hasProperty(actions, 'position')
                && hasProperty(actions, 'strategy')) {
                throw Error(`'position' and 'strategy' found. Chose either one of them.`);
            }
        }

        if (hasProperty(actions, 'crop')) {

            if (!hasProperty(actions, 'cheight')
                && !hasProperty(actions, 'cwidth')) {
                throw Error(`action 'crop' requires at least 'cheight', 'cwidth', or both.`);
            }
        }
    },
    serveBufferImage: (res, content, extension) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type','image/' + extension);
        res.write(content, 'binary');
        return res.end(null, 'binary');
    },

    buildSharpObject: async ({ actions, file, localPaths }) => {

        const localFilePath = join(localPaths.images.input, file.full);
        const pImage = await sharp(localFilePath);

        if (hasProperty(actions, 'object.resize')) {
            let resizeObject = {};

            if (hasProperty(actions, 'object.height')) {
                resizeObject.height = actions.object.height;
            }

            if (hasProperty(actions, 'object.width')) {
                resizeObject.width = actions.object.width;
            }

            if (hasProperty(actions, 'object.fit')) {
                resizeObject.fit = actions.object.fit;
            }

            if (hasProperty(actions, 'object.position')) {
                resizeObject.position = actions.object.position;
            } else if (hasProperty(actions, 'object.strategy')) {
                resizeObject.position = actions.object.strategy;
            }

            pImage.resize(resizeObject);
        }

        if (hasProperty(actions, 'object.crop')) {
            // TODO: add dependencies for cleft, cbottom, cheight, and cwidth.
            pImage.extract({
                left: actions.object.oleft,
                top: actions.object.otop,
                width: actions.object.cwidth,
                height: actions.object.cheight,
            });

        } else if (hasProperty(actions, 'object.extend')) {
            let extendObject = actions.object.extend;

            if (hasProperty(actions, 'object.background')) {
                extendObject.background = actions.object.background;
            }

            pImage.extend(extendObject);
        }

        let toFormatObject = {
            quality: hasProperty(actions, 'object.quality')
                ? parseInt(actions.object.quality)
                : undefined
        };

        if (hasProperty(actions, 'object.gamma')) {
            pImage.gamma(actions.object.gamma);
        }

        if (hasProperty(actions, 'object.median')) {
            pImage.median(actions.object.median);
        }

        if (hasProperty(actions, 'object.blur')) {
            pImage.blur(actions.object.blur);
        }

        if (hasProperty(actions, 'object.sharpen')) {
            const { sigma, flat, jagged } = actions.object.sharpen;
            pImage.sharpen(
                sigma,
                flat,
                jagged
            );
        }

        if (hasProperty(actions, 'object.rotate')) {
            pImage
                .rotate(
                    actions.object.rotate, hasProperty(actions, 'object.background')
                        ? {
                            background: actions.object.background,
                        }: undefined);
        }

        if (hasProperty(actions, 'object.linear')) {
            pImage
                .linear(
                    actions.object.linear.multiplier,
                    actions.object.linear.offset
                );
        }

        pImage
            .normalise(hasProperty(actions, 'object.normalise'))
            .negate(hasProperty(actions, 'object.negate'))
            .flip(hasProperty(actions, 'object.flip'))
            .flop(hasProperty(actions, 'object.flop'))
            .toFormat(file.extension, toFormatObject);

        return pImage.toBuffer();
    },
};

module.exports = helpers;
