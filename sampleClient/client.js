const { exit } = require('../lib/logging');
const grpc = require('grpc');
const certs = require('../lib/certs');
const path = require('path');
const config = require('../config');

async function setupClient() {
    const exchange = await grpc.load({ file: 'exchange.proto', root: path.resolve(__dirname, '../proto') });
    const keyPair = certs.loadKeyPair('client');
    const CA = certs.loadCA();
    if (!keyPair || !CA) {
        exit('Could not load certificates. Exiting.', 1);
        return;
    }
    const creds = grpc.credentials.createSsl(certs.loadCA(), keyPair.private_key, keyPair.cert_chain);
    const serverHost = `${config.server.hostname}:${config.server.port}`;
    return new exchange.rpc_crypto.Exchange(serverHost, creds);
}

module.exports = {
    setupClient
};
