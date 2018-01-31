'use strict';
const config = require('../config');
const grpc = require('grpc');
const certs = require('../lib/certs');
const { logger, exit } = require('../lib/logging');
const addExchangeService = require('../lib/protoImpl/exchange');

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
async function main() {
    try {
        const keyPair = await certs.loadKeyPair('server');
        const sslCreds = grpc.ServerCredentials.createSsl(null, [keyPair], true);
        const server = new grpc.Server();
        await addExchangeService(server);
        const serverHost = `${config.server.hostname}:${config.server.port}`;
        server.bind(serverHost, sslCreds);
        server.start();
        logger.log('info', `Listening on ${serverHost}`);
    } catch (err) {
        logger.error(err);
        exit('Goodbye', 0);
    }
}

main();
