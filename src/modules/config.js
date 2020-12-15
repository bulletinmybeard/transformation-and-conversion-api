const sharp = require('sharp');

module.exports = {
    server: {
        port: 1337,
    },
    projects: {
        test: {
            storage: 'redis',
        },
    },
    sources: [
        'redis',
        'fs',
        'raw',
        'preview',
    ],
    /**
     * Presets can be used to define complex transformations per project and to keep URLs short.
     *
     * Without preset: test/image/w_500,h_500,r_fit,p_left_bottom/sample.jpg
     * With preset: test/image/pr_featured/sample.jpg
     */
    presets: {
        image: {
            featured: {
                width: 500,
                height: 500,
                resize: 'fit',
                position: 'left_bottom',
                projects: [
                    'test',
                ]
            },
        },
        video: {},
    },
    dependencies: {
        resize: [
            'height',
            'width',
            'aspectRatio',
        ]
    },
    formats: {
        image: [
            'png',
            'jpe',
            'jpg',
            'jpeg',
            'gif',
            'webp',
        ],
        video: [
            'mov',
            'avi',
            'mpeg',
            'mp4',
        ],
    },
    options: {
        height: [],
        width: [],
        extend: [],
        crop: [],
        resize: [
            'cover',
            'contain',
            'fill',
            'inside',
            'outside',
        ],
        position: Object.keys(sharp.position)
            .map(pos =>
                pos
                    .replace(
                        ' ',
                        '_')),
        kernel: Object.keys(sharp.kernel),
        gravity: Object.keys(sharp.gravity),
        strategy: Object.keys(sharp.strategy),
        format: Object.keys(sharp.format),
        fit: Object.keys(sharp.fit),
        colour: [
            'multiband',
            'bw',
            'cmyk',
            'srgb',
            'b-w',
        ],
    },
};
