const services = require('../build/node/currencies_grpc_pb');
const messages = require('../build/node/currencies_pb');

const canonicalCurrencies = [
    {
        canonicalSymbol: 'BTC',
        symbol: 'BTC',
        decimals: 10
    },
    {
        canonicalSymbol: 'LTC',
        symbol: 'LTC',
        decimals: 10
    }
];

function getCurrencies() {
    const result = messages.SupportedCurrencies();
    result.setSupportedCurrencies(canonicalCurrencies);
}

module.exports = function(server) {
    server.addService(services.CurrenciesService, {getCurrencies});
};
