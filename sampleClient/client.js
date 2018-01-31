const { exit } = require('../lib/logging');
const grpc = require('grpc');
const certs = require('../lib/certs');
const path = require('path');

async function setupClient() {
    const exchange = await grpc.load({ file: 'exchange.proto', root: path.resolve(__dirname, '../proto') });
    const keyPair = certs.loadKeyPair('client');
    const CA = certs.loadCA();
    if (!keyPair || !CA) {
        exit('Could not load certificates. Exiting.', 1);
        return;
    }
    const creds = grpc.credentials.createSsl(certs.loadCA(), keyPair.private_key, keyPair.cert_chain);
    return new exchange.rpc_crypto.Exchange('localhost:50051', creds);
}

module.exports = {
    setupClient
};
