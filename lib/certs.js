/* eslint-disable camelcase */
const config = require('../config');
const log = require('../lib/logging');
const fs = require('fs');

function loadCA() {
    try {
        return fs.readFileSync(config.certs.ca);
    } catch (err) {
        log.error(err.message);
        return null;
    }
}

function loadKeyPair(certName) {
    const certs = config.certs && config.certs[certName];
    if (!certs) {
        return null;
    }
    return {
        private_key: fs.readFileSync(certs.key),
        cert_chain: fs.readFileSync(certs.cert)
    };
}

module.exports = { loadKeyPair, loadCA };
