/* jshint node:true */
'use strict';

const services = require('../build/proto/session_grpc_pb');
const messages = require('../build/proto/session_pb');
const grpc = require('grpc');
const certs = require("../lib/certs");

function main() {
    const keyPair = certs.loadKeyPair('client');
    const creds = grpc.credentials.createSsl(certs.loadCA(), keyPair.private_key, keyPair.cert_chain);
    const client = new services.SessionClient('localhost:50051', creds);
    const req = new messages.SessionCreateRequest();
    client.sessionCreate(req, (err, res) => {
        console.log(err);
        console.log(res.getSessionId());
    });

}

main();
