'use strict';

const services = require('../build/node/session_grpc_pb');
const messages = require('../build/node/session_pb');
const grpc = require('grpc');
const certs = require('../lib/certs');
const { logger, exit } = require('../lib/logging');
/**
 * Implements the SayHello RPC method.
 */
function createSession(call, callback) {
    const reply = new messages.SessionCreateResponse();
    reply.setSessionId('1234567abcd');
    callback(null, reply);
}



/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
async function main() {
    try {
        const keyPair = await certs.loadKeyPair('server');
        const ssl_creds = grpc.ServerCredentials.createSsl(null, [keyPair], true);
        const server = new grpc.Server();
        server.addService(services.SessionService, {sessionCreate: createSession});
        server.bind('0.0.0.0:50051', ssl_creds);
        server.start();
        logger.log('info', 'Listening on port 50051');
    } catch (err) {
        logger.error(err);
        exit('Goodbye', 0);
    }
}

main();