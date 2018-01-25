/* jshint node:true */
'use strict';

const config = require('../config');
const fs = require('fs');

function loadCA() {
    return fs.readFileSync(config.certs.ca);
}

function loadKeyPair(certName) {
    const certs = config.certs && config.certs[certName];
    if (!certs) return null;
    return {
        private_key: fs.readFileSync(certs.key),
        cert_chain: fs.readFileSync(certs.cert),
    };
}

module.exports = { loadKeyPair, loadCA };
