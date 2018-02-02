/* eslint-disable camelcase */

const assert = require('assert');
const exchange = require('../lib/protoImpl/exchange');
const streams = require('stream');
const grpc = require('grpc');
const nock = require('nock');

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
            assert.equal(res.required_credentials.api_key, true);
            assert.equal(res.required_credentials.secret, true);
            assert.equal(res.required_credentials.password, true);
            done();
        });
    });

    it('listExchanges', done => {
        const writable = newCall();
        exchange.listExchanges(writable);
        writable.on('finish', () => {
            assert.ok(writable.count > 90);
            assert.equal(writable.errorCount, 0);
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
        assert.ok(handlers['/rpc_crypto.Exchange/addExchange']);
        assert.ok(handlers['/rpc_crypto.Exchange/getTradePairs']);
    });

    it('addExchange with unauthenticated connection', done => {
        const req = { id: 'gdax' };
        exchange.addExchange({ request: req }, (err, res) => {
            assert.ifError(err);
            assert.equal(res.handle, 1);
            assert.equal(res.authenticated, false);
            done();
        });
    });

    it('addExchange with authenticated connection', done => {
        const req = {
            id: 'poloniex',
            api_credentials: {
                api_key: 'apikey',
                secret: 'apisecret'
            }
        };
        exchange.addExchange({ request: req }, (err, res) => {
            assert.ifError(err);
            assert.equal(res.handle, 2);
            assert.equal(res.authenticated, true);
            done();
        });
    });

    it('tradePairs handles non-responsive exchange', done => {
        nock('https://api.gdax.com')
            .get('/products')
            .reply(503, { message: 'borked' });
        const call = newCall({ handle: 1 });
        exchange.getTradePairs(call);
        call.on('finish', () => {
            assert.equal(call.count, 0);
            assert.equal(call.errorCount, 1);
            assert.equal(call.errors[0].code, grpc.status.UNAVAILABLE);
            done();
        });
    });

    it('getTradePairs', done => {
        nock('https://api.gdax.com')
            .get('/products')
            .reply(200, [
                {
                    'id': 'BTC-USD',
                    'base_currency': 'BTC',
                    'quote_currency': 'USD',
                    'base_min_size': '0.001',
                    'base_max_size': '70',
                    'quote_increment': '0.01',
                    'display_name': 'BTC/USD',
                    'status': 'online',
                    'min_market_funds': '10',
                    'max_market_funds': '1000000'
                }, {
                    'id': 'ETH-BTC',
                    'base_currency': 'ETH',
                    'quote_currency': 'BTC',
                    'base_min_size': '0.01',
                    'base_max_size': '600',
                    'quote_increment': '0.00001',
                    'display_name': 'ETH/BTC',
                    'status': 'online',
                    'min_market_funds': '0.001',
                    'max_market_funds': '50'
                }
            ]);
        const call = newCall({ handle: 1 });
        exchange.getTradePairs(call);
        call.on('finish', () => {
            assert.equal(call.count, 2);
            assert.equal(call.errorCount, 0);
            const BTCUSD = call.data[0];
            assert.equal(BTCUSD.id, 'BTC-USD');
            assert.equal(BTCUSD.symbol, 'BTC/USD');
            assert.equal(BTCUSD.base, 'BTC');
            assert.equal(BTCUSD.quote, 'USD');
            done();
        });
    });

    it('getTicker', done => {
        nock('https://api.gdax.com')
            .get('/products/BTC-USD/ticker')
            .reply(200, {
                'trade_id': 35378079,
                'price': '8924.00000000',
                'size': '0.00493623',
                'bid': '8923.04',
                'ask': '8923.05',
                'volume': '37667.55396369',
                'time': '2018-02-01T22:45:44.547000Z'
            });
        const req = {
            handle: 1,
            symbol: 'BTC/USD'
        };
        exchange.getTicker({ request: req }, (err, res) => {
            assert.ifError(err);
            assert.equal(res.symbol, 'BTC/USD');
            assert.equal(res.timestamp, 1517525144547);
            assert.equal(res.bid, 8923.04);
            assert.equal(res.ask, 8923.05);
            assert.equal(res.base_volume, 37667.55396369);
            done();
        });
    });

    it('getTicker with no handle', done => {
        const req = {
            symbol: 'BTC/USD'
        };
        exchange.getTicker({ request: req }, err => {
            assert.equal(err.code, grpc.status.INVALID_ARGUMENT);
            done();
        });
    });

    it('getTicker with incorrect handle', done => {
        const req = {
            handle: -1,
            symbol: 'BTC/USD'
        };
        exchange.getTicker({ request: req }, err => {
            assert.equal(err.code, grpc.status.NOT_FOUND);
            done();
        });
    });

    it('getTicker with GDAX down', done => {
        nock('https://api.gdax.com')
            .get('/products/BTC-USD/ticker')
            .reply(404, {});
        const req = {
            handle: 1,
            symbol: 'BTC/USD'
        };
        exchange.getTicker({ request: req }, (err, res) => {
            assert.equal(err.code, grpc.status.NOT_FOUND);
            done();
        });
    });

    it('getTickers', done => {
        const call = newCall({ handle: 1 });
        exchange.getTickers(call);
        call.on('finish', () => {
            assert.equal(call.errorCount, 1);
            assert.equal(call.errors[0].code, grpc.status.UNIMPLEMENTED);
            done();
        });
    });
});

function newCall(req) {
    const writable = new streams.Writable({
        objectMode: true,
        write: function(obj, enc, cb) {
            this.count++;
            this.data.push(obj);
            cb(null);
        },
        final: function(cb) {
            this.closed = true;
            cb();
        }
    });
    writable.request = req;
    writable.count = 0;
    writable.data = [];
    writable.errors = [];
    writable.errorCount = 0;
    writable.closed = false;
    writable.on('error', err => {
        writable.errorCount++;
        writable.errors.push(err);
    });
    return writable;
}
