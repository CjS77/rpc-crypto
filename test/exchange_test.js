/* eslint-disable camelcase */

const assert = require('assert');
const exchange = require('../lib/protoImpl/exchange');
const streams = require('stream');
const grpc = require('grpc');

describe('exchange service module', () => {
    it('mapCredentials', () => {
        const out = exchange.mapCredentials({
            'apiKey': true,
            'secret': true,
            'uid': false,
            'password': false
        });
        assert.deepEqual(out, {
            api_key: true,
            secret: true,
            uid: false,
            login: undefined,
            password: false
        });
    });

    it('mapURLs', () => {
        const out = exchange.mapURLs({
            'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
            'api': 'https://api.bitfinex.com',
            'www': 'https://www.bitfinex.com',
            'doc': [
                'https://bitfinex.readme.io/v1/docs',
                'https://github.com/bitfinexcom/bitfinex-api-node'
            ]
        });
        assert.deepEqual(out, {
            www: 'https://www.bitfinex.com',
            api: 'https://api.bitfinex.com',
            doc: 'https://bitfinex.readme.io/v1/docs'
        });
    });

    it('mapCapabilities', () => {
        const out = exchange.mapCapabilities({});
        assert.deepEqual(out, {
            cors: false,
            public_api: false,
            private_api: false,
            cancel_order: false,
            create_deposit_address: false,
            create_order: false,
            deposit: false,
            fetch_balance: false,
            fetch_closed_orders: false,
            fetch_currencies: false,
            fetch_deposit_address: false,
            fetch_markets: false,
            fetch_my_trades: false,
            fetch_ohlcv: false,
            fetch_open_orders: false,
            fetch_order: false,
            fetch_order_book: false,
            fetch_orders: false,
            fetch_ticker: false,
            fetch_tickers: false,
            fetch_bids_asks: false,
            fetch_trades: false,
            withdraw: false
        });
    });

    it('mapExchangeinfo', () => {
        const out = exchange.mapExchangeInfo({
            'id': 'test',
            'name': 'Test Exchange',
            'countries': ['US', 'UK'],
            'has': {
                'publicAPI': true,
                'privateAPI': true,
                'fetchTrades': true
            },
            'urls': { www: 'http://test.com' },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true
            }
        });
        assert.equal(out.id, 'test');
        assert.equal(out.name, 'Test Exchange');
        assert.deepEqual(out.countries, ['US', 'UK']);
        assert.ok(out.urls);
        assert.ok(out.capabilities.public_api);
        assert.ok(out.capabilities.fetch_trades);
        assert.ok(out.capabilities.cors === false);
        assert.ok(out.required_credentials);
    });

    it('getExchangeIDs', done => {
        exchange.getExchangeIDs(null, (err, res) => {
            assert.ifError(err);
            assert.ok(Array.isArray(res));
            assert.ok(res.length > 90);
            done();
        });
    });

    it('getExchangeInfo', done => {
        const req = { id: 'gdax' };
        exchange.getExchangeInfo({ request: req }, (err, res) => {
            assert.ifError(err);
            assert.equal(res.id, 'gdax');
            assert.equal(res.name, 'GDAX');
            assert.equal(res.urls.api, 'https://api.gdax.com');
            done();
        });
    });

    it('listExchanges', done => {
        const writable = new streams.Writable({
            objectMode: true,
            write: function(obj, enc, cb) {
                this.count++;
                cb(null);
            }
        });
        writable.count = 0;
        exchange.listExchanges(writable);
        writable.on('finish', () => {
            assert.ok(writable.count > 90);
            done();
        });
    });

    it('initService', async() => {
        const server = new grpc.Server();
        await exchange.initService(server);
        const handlers = server.handlers;
        assert.ok(handlers['/rpc_crypto.Exchange/getExchangeIDs']);
        assert.ok(handlers['/rpc_crypto.Exchange/getExchangeInfo']);
        assert.ok(handlers['/rpc_crypto.Exchange/listExchanges']);
    });
});
