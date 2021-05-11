const log = require('simple-node-logger').createSimpleFileLogger(`${__dirname}/app.log`);

log.setLevel('info');

module.exports = {
    Info: (text) => {
        console.log(text);
        log.info(text);

    },

    Error: (text) => {
        console.error(text);
        log.error(text);

    }
};