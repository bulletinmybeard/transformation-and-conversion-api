let { formats, options, projects, presets, sources } = require('./config');

const projectNames = Object.keys(projects).join('|');
const supportedFormats = [...(formats.video).length
    ? formats.video
    : [], ...(formats.image).length
        ? formats.image
        : []].join('|');
const supportedPresets = [...(Object.keys(presets.video).length)
    ? Object.keys(presets.video)
    : [], ...(Object.keys(presets.image).length)
        ? Object.keys(presets.image)
        : []].join('|');

sources = sources.join('|');
formats = Object.keys(formats).join('|');

module.exports = {
    baseUrl: `^\/(${projectNames})\/?(${formats})\/?(${sources})?\\/([:.,_\\w]+)\\/([-\\w]+)\\.(${supportedFormats})$`,
    baseUrlPreset: `^\/(${projectNames})\/(${formats})\/?(${sources})\/pr_(${supportedPresets})\/(.*)\.(${supportedFormats})$`,
    quality: '^q_([1-9][0-9]?|100)([:force]+)?$',
    resize: `^r_(${options.resize.join('|')})$`,
    height: '^h_([\\.\\d]+)$',
    width: '^w_([\\.\\d|]+)$',
    gamma: '^gamma_([\\.\\d|]+)$',
    blur: '^blur_([\\.\\d|]+)$',
    rotate: '^rotate_([\\.\\d|]+)$',
    linear: '^linear_?([\\.\\d|]+)?_?([\\.\\d|]+)?$',
    median: '^median_?([\\.\\d|]+)?$',
    sharpen: '^sharpen_([\\.\\d|]+)_([\\.\\d|]+)_([\\.\\d|]+)$',
    colour: `^co_([${options.position.join('|')}]+)$`,
    cheight: '^ch_([\\.\\d]+)$',
    cwidth: '^cw_([\\.\\d]+)$',
    oleft: '^oleft_([\\.\\d]+)$',
    convertFrom: `^convert_from:([${supportedFormats}]+)$`,
    otop: '^otop_([\\.\\d]+)$',
    cbottom: '^cbottom_([\\.\\d]+)$',
    position: `^p_([\\.\\d]+)_([\\.\\d]+)_([\\.\\d]+)_([\\.\\d]+)$`,
    gravity: `^[^\\s\\.][g|gravity]+_([${options.gravity.join('|')}]+)$`,
    fit: `^[^\\s\\.][fit]+_([${options.fit.join('|')}]+)$`,
    extend: `^ex_([\\d]+_[\\d]+_[\\d]+_[\\d]+)$`,
    background: `^bg_([0-255]+_[0-255]+_[0-255]+_[.\\d]+)$`,
    strategy: `^s_([${options.strategy.join('|')}]+)$`,
    singleActions: '^[^\\s\\.][crop|flatten|negate|convolve|normalise|lossless|flip|flop]+$',
};
