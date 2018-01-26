const winston = require('winston');

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            timestamp: function () {
                return (new Date()).toISOString();
            }
        })
    ]
});

module.exports = logger;

