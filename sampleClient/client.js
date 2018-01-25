/* jshint node:true */
'use strict';

const services = require('../build/proto/session_grpc_pb');
const messages = require('../build/proto/session_pb');
const grpc = require('grpc');

function main() {
    const client = new services.SessionClient('localhost:50051', grpc.credentials.createInsecure());
    const req = new messages.SessionCreateRequest();
    client.sessionCreate(req, (err, res) => {
        console.log(err);
        console.log(res.getSessionId());
    });

}

main();