const winston = require('winston');

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            timestamp: function() {
                return (new Date()).toISOString();
            }
        })
    ]
});

function exit(msg, code = 0) {
    const level = code === 0 ? 'info' : 'error';
    logger.log(level, msg);
    process.exit(code);
}

module.exports = {logger, exit};
