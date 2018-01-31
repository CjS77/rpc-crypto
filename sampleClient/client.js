/* jshint node:true */
'use strict';

import {exit} from '../lib/logging';
const services = require('../build/node/exchange_grpc_pb');
const messages = require('../build/node/exchange_pb');
const grpc = require('grpc');
const certs = require('../lib/certs');
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
    client.getExchangesList(req, (err, res) => {
        err && logger.log(err);
        logger.info({message: 'Exchanges', exchanges: res});
        logger.info(res.getVersion());
        logger.info(res.getExchangesList());
        exit('Thanks for playing');
    });
}

main();
