/* eslint-disable camelcase,standard/no-callback-literal */

const grpc = require('grpc');
const ccxt = require('ccxt');
const path = require('path');
const assert = require('assert');

let exchanges;
let exchangeList;
let protoRoot;

async function getRoot() {
    if (!protoRoot) {
        protoRoot = await grpc.load({ file: 'exchange.proto', root: path.resolve(__dirname, '../../proto') });
    }
    return Promise.resolve(protoRoot);
}

/**
 * The CCXT exchange info is static, but must still be (lazily) evaluated from the service.
 * @param {writable} call
 */
function listExchanges(call) {
    loadExchangeData();
    exchangeList.forEach(ex => {
        call.write(ex);
    });
    call.end();
}

function loadExchangeData() {
    if (!exchanges) {
        exchanges = ccxt.exchanges;
    }
    if (!exchangeList) {
        let exchangeInfo = exchanges.map(ex => {
            const info = new ccxt[ex]().describe();
            return mapExchangeInfo(info);
        });
        exchangeList = exchangeInfo.filter(i => i !== null);
        assert(Array.isArray(exchangeList));
    }
}

function getExchangeInfo(call, cb) {
    const id = call.request.id;
    if (!id) {
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: 'No exchange ID was provided'
        }, null);
    }
    loadExchangeData();
    const info = exchangeList.find(ex => ex.id === id);
    if (!info) {
        return cb({
            code: grpc.status.NOT_FOUND,
            message: `No exchange with id ${id} exists`
        });
    }
    cb(null, info);
}

function getExchangeIDs(req, cb) {
    if (!exchanges) {
        exchanges = ccxt.exchanges;
    }
    cb(null, exchanges);
}

/**
 * Maps field names from CCXT to gRPC
 */
function mapExchangeInfo(info) {
    return {
        id: info.id,
        name: info.name,
        countries: info.countries,
        capabilities: mapCapabilities(info.has),
        urls: mapURLs(info.urls),
        version: info.version,
        required_credentials: mapCredentials(info.requiredCredentials)
    };
}

/**
 * Maps exchange features to gRPC fields
 */
function mapCapabilities(has) {
    function hasFeature(feature) {
        return has[feature] === true || has[feature] === 'emulated' || false;
    }

    return {
        cors: hasFeature('CORS'),
        public_api: hasFeature('publicAPI'),
        private_api: hasFeature('privateAPI'),
        cancel_order: hasFeature('cancelOrder'),
        create_deposit_address: hasFeature('createDepositAddress'),
        create_order: hasFeature('createOrder'),
        deposit: hasFeature('deposit'),
        fetch_balance: hasFeature('fetchBalance'),
        fetch_closed_orders: hasFeature('fetchClosedOrders'),
        fetch_currencies: hasFeature('fetchCurrencies'),
        fetch_deposit_address: hasFeature('fetchDepositAddress'),
        fetch_markets: hasFeature('fetchMarkets'),
        fetch_my_trades: hasFeature('fetchMyTrades'),
        fetch_ohlcv: hasFeature('fetchOHLCV'),
        fetch_open_orders: hasFeature('fetchOpenOrders'),
        fetch_order: hasFeature('fetchOrder'),
        fetch_order_book: hasFeature('fetchOrderBook'),
        fetch_orders: hasFeature('fetchOrders'),
        fetch_ticker: hasFeature('fetchTicker'),
        fetch_tickers: hasFeature('fetchTickers'),
        fetch_bids_asks: hasFeature('fetchBidsAsks'),
        fetch_trades: hasFeature('fetchTrades'),
        withdraw: hasFeature('withdraw')
    };
}

function mapURLs(urls) {
    const result = {};
    ['www', 'api', 'doc'].forEach(field => {
        switch (typeof urls[field]) {
            case 'string':
                result[field] = urls[field];
                break;
            case 'object':
                if (Array.isArray(urls[field])) {
                    result[field] = urls[field][0];
                } else {
                    result[field] = urls[field].private || urls[field].public || urls[field].web || '';
                }
                break;
            default:
                result[field] = '';
        }
    });
    return result;
}

function mapCredentials(required) {
    return {
        api_key: required.apiKey,
        secret: required.secret,
        uid: required.uid,
        login: required.login,
        password: required.password
    };
}

async function initService(server) {
    const root = await getRoot();
    server.addService(root.rpc_crypto.Exchange.service, {
        getExchangeInfo: getExchangeInfo,
        getExchangeIDs: getExchangeIDs,
        listExchanges: listExchanges
    });
}

if (process.env.NODE_ENV === 'test') {
    module.exports = {
        initService,
        mapCredentials,
        mapURLs,
        mapCapabilities,
        mapExchangeInfo,
        getExchangeInfo,
        listExchanges,
        getExchangeIDs
    };
} else {
    module.exports = { initService };
}
