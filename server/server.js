'use strict';

const grpc = require('grpc');
const certs = require('../lib/certs');
const {logger, exit} = require('../lib/logging');
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
        server.bind('0.0.0.0:50051', sslCreds);
        server.start();
        logger.log('info', 'Listening on port 50051');
    } catch (err) {
        logger.error(err);
        exit('Goodbye', 0);
    }
}

main();
