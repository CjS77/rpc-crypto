const sampleClient = require('../../sampleClient/client');
const assert = require('assert');

describe('Exchange Service', () => {
    let client;
    before(async() => {
        client = await sampleClient.createClient();
    });

    it('requests exchange ids', done => {
        client.getExchangeIDs({}, (err, res) => {
            assert.ifError(err);
            assert.ok(res.id.length > 90);
            assert.ok(res.id.includes('gdax'));
            assert.ok(res.id.includes('bittrex'));
            assert.ok(res.id.includes('bitmex'));
            done();
        });
    });

    it('requests an exchange info', done => {
        client.getExchangeInfo({ id: 'gdax' }, (err, res) => {
            assert.ifError(err);
            assert.equal(res.id, 'gdax');
            assert.equal(res.urls.api, 'https://api.gdax.com');
            assert.equal(res.required_credentials.password, true);
            assert.equal(res.capabilities.cors, true);
            done();
        });
    });

    it('requests all exchange info', done => {
        const stream = client.listExchanges({});
        let count = 0;
        stream.on('data', ex => {
            count++;
            assert.ok(typeof ex.id === 'string');
            assert.ok(!!ex.urls, `${ex.id} urls`);
            assert.ok(!!ex.required_credentials, `${ex.id} required credentials`);
            assert.ok(!!ex.capabilities, `${ex.id} capabilities`);
        });
        stream.on('error', err => {
            throw err;
        });
        stream.on('end', () => {
            assert.ok(count > 90);
            done();
        });
    });

    it('addExchange with unauthenticated connection', done => {
        const req = { id: 'gdax' };
        client.addExchange(req, (err, res) => {
            assert.ifError(err);
            assert.equal(res.handle, 1);
            assert.equal(res.authenticated, false);
            done();
        });
    });

    it('getTradePairs', done => {
        const call = client.getTradePairs({ handle: 1 });
        call.on('data', (pair) => {
            assert.ok(pair.id);
            assert.ok(pair.symbol);
            assert.ok(pair.base);
            assert.ok(pair.quote);
        });
        call.on('end', done);
    });
});
