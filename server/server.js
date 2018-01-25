/* jshint node:true */
'use strict';

const services = require('../build/proto/session_grpc_pb');
const messages = require('../build/proto/session_pb');
const grpc = require('grpc');

/**
 * Implements the SayHello RPC method.
 */
function createSession(call, callback) {
    var reply = new messages.SessionCreateResponse();
    reply.setSessionId('1234567abcd');
    callback(null, reply);
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
    var server = new grpc.Server();
    server.addService(services.SessionService, {sessionCreate: createSession});
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();
    console.log('Listening on port 50051');
}

main();