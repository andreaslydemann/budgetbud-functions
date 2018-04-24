const da = require('./locales/da');

module.exports.t = function (text, language) {
    switch (language) {
        case 'da':
            return da.responses[text];
        default:
            return da.responses[text];
    }
};
