/* jshint node:true */
'use strict';

const services = require('../build/proto/session_grpc_pb');
const messages = require('../build/proto/session_pb');
const grpc = require('grpc');
const certs = require("../lib/certs");
const logger = require('../lib/logging');

function main() {
    const keyPair = certs.loadKeyPair('client');
    const CA = certs.loadCA();
    if (!keyPair || !CA) {
        exit('Could not load certificates. Exiting.', 1);
        return;
    }
    const creds = grpc.credentials.createSsl(certs.loadCA(), keyPair.private_key, keyPair.cert_chain);
    const client = new services.SessionClient('localhost:50051', creds);
    const req = new messages.SessionCreateRequest();
    client.sessionCreate(req, (err, res) => {
        err && logger.log(err);
        logger.info({ message: 'Session created', session: res });
        logger.info(res.getSessionId());
        exit('Thanks for playing')
    });
}

main();
