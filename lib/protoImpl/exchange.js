/* eslint-disable camelcase,standard/no-callback-literal */

const grpc = require('grpc');
const path = require('path');
const ExchangeManager = require('../exchangeManager');
const { objToCamelCase } = require('../utils');
const pick = require('lodash.pick');
const logger = require('../logging');

let protoRoot;
const exchangeManager = new ExchangeManager();

// ------------------------------- gRPC implementation functions --------------------------------------------------- //

/**
 * Loads the .proto file and all dependencies, returning the root protobuf definition object
 * @return {Promise<any>}
 */
async function getRoot() {
    if (!protoRoot) {
        protoRoot = await grpc.load({ file: 'exchange.proto', root: path.resolve(__dirname, '../../proto') });
    }
    return Promise.resolve(protoRoot);
}

/**
 * Streams all the metadata for all the supported exchanges out to the given stream.
 * @param {writable} call
 */
function listExchanges(call) {
    ExchangeManager.exchanges.forEach(id => {
        const info = ExchangeManager.getExchangeInfo(id);
        call.write(mapExchangeInfo(info));
    });
    call.end();
}

/**
 * Returns the metadata for the given exchange id
 * @return {*}
 */
function getExchangeInfo(call, cb) {
    const id = call.request.id;
    if (!id) {
        return cb({
            code: grpc.status.INVALID_ARGUMENT,
            message: 'No exchange ID was provided'
        }, null);
    }
    const info = ExchangeManager.getExchangeInfo(id);
    if (!info) {
        return cb({
            code: grpc.status.NOT_FOUND,
            message: `No exchange with id ${id} exists`
        });
    }
    cb(null, mapExchangeInfo(info));
}

/**
 * Returns the list of supported exchange IDs from CCXT in the callback
 */
function getExchangeIDs(call, cb) {
    cb(null, ExchangeManager.exchanges);
}

function addExchange(call, cb) {
    const id = call.request.id;
    const apiCreds = objToCamelCase(call.request.api_credentials);
    const exchange = exchangeManager.addExchange(id, apiCreds);
    if (!exchange) {
        return cb({
            code: grpc.status.NOT_FOUND,
            message: `No exchange with id ${id} exists`
        });
    }
    return cb(null, {
        handle: exchange.id,
        authenticated: exchangeManager.isAuthenticated(exchange.id)
    });
}

/**
 * Fetch the trade pair information for a given exchange
 * @param call
 */
async function getTradePairs(call) {
    const id = call.request.handle;
    const reload = call.request.reload || false;
    const exchange = exchangeManager.getExchange(id);
    if (!exchange) {
        call.end();
        return;
    }
    try {
        let markets = await exchange.loadMarkets(reload);
        markets = markets || {};
        Object.values(markets).forEach(market => {
            const tradePairInfo = mapMarket(market);
            call.write(tradePairInfo);
        });
    } catch (err) {
        const msg = `Could not load markets for ${exchange.name}`;
        logger.error(msg, err.message);
        call.emit('error', { code: grpc.status.UNAVAILABLE, message: `${msg}. ${err.message}` });
    }
    call.end();
}

// ------------------------------------- Support functions --------------------------------------------------------- //

/**
 * Maps a CCXT market info object to the gRPC format
 */
function mapMarket(market) {
    const tradePairInfo = pick(market, ['symbol', 'id', 'base', 'quote', 'active', 'lot', 'precision']);
    tradePairInfo.size_limit = market.limits.amount;
    tradePairInfo.price_limit = market.limits.price;
    tradePairInfo.value_limit = market.limits.cost;
    tradePairInfo.info = JSON.stringify(market.info);
    return tradePairInfo;
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

/**
 * Maps CCXT url field to gPRC fields
 */
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

/**
 * Maps credentials_required to gRPC boolean/string fields
 */
function mapCredentials(required) {
    return {
        api_key: required.apiKey,
        secret: required.secret,
        uid: required.uid,
        login: required.login,
        password: required.password
    };
}

/**
 * Given a gRPC service instance, adds the Exchange service to it
 * @param server
 * @return {Promise<void>}
 */
async function initService(server) {
    const root = await getRoot();
    server.addService(root.rpc_crypto.Exchange.service, {
        getExchangeInfo: getExchangeInfo,
        getExchangeIDs: getExchangeIDs,
        listExchanges: listExchanges,
        addExchange: addExchange,
        getTradePairs: getTradePairs
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
        getExchangeIDs,
        addExchange,
        getTradePairs
    };
} else {
    module.exports = { initService };
}
