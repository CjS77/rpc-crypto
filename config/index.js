'use strict';

const config = require('./config.json');

const defaultConfig = {
    server: {
        hostname: 'localhost',
        port: 50051
    },
    rest: {
        hostname: 'localhost',
        port: 8080
    },
    certs: {
        ca: 'config/ca.cert.pem',
        client: {
            cert: 'config/client.crt',
            key: 'config/client.key'
        },
        server: {
            cert: 'config/server.crt',
            key: 'config/server.key'
        }
    }
};

module.exports = Object.assign(defaultConfig, config);
