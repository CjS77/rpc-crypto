const grpc = require('grpc');
const certs = require('../lib/certs');
const path = require('path');
const config = require('../config');

async function createClient() {
    const exchange = await grpc.load({ file: 'exchange.proto', root: path.resolve(__dirname, '../proto') });
    const keyPair = certs.loadKeyPair('client');
    const CA = certs.loadCA();
    if (!keyPair || !CA) {
        return Promise.reject(new Error('Could load SSL certificates. Check your config file.'));
    }
    const creds = grpc.credentials.createSsl(certs.loadCA(), keyPair.private_key, keyPair.cert_chain);
    const serverHost = `${config.server.hostname}:${config.server.port}`;
    return new exchange.rpc_crypto.Exchange(serverHost, creds);
}

module.exports = {
    createClient
};
