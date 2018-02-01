const ccxt = require('ccxt');

class ExchangeManager {
    constructor() {
        this._nextId = 1;
        this.instances = {};
    }

    static getExchangeInfo(id) {
        return new ccxt[id]().describe();
    }

    static get exchanges() {
        return ccxt.exchanges;
    }

    get size() {
        return Object.keys(this.instances).length;
    }

    getExchange(id) {
        return this.instances[id];
    }

    getInstanceArray() {
        return Object.values(this.instances);
    }

    nextId() {
        return this._nextId++;
    }

    addExchange(exchangeId, apiCredentials) {
        try {
            let id = this.nextId();
            const ex = this.instances[id] = new ccxt[exchangeId]({ id: id });
            if (apiCredentials) {
                ['apiKey', 'secret', 'uid', 'login', 'password'].forEach(key => {
                    if (apiCredentials[key]) {
                        ex[key] = apiCredentials[key];
                    }
                });
            }
            return ex;
        } catch (err) {
            return null;
        }
    }

    isAuthenticated(handle) {
        const ex = this.instances[handle];
        if (!ex) {
            return false;
        }
        try {
            ex.checkRequiredCredentials();
            return true;
        } catch (err) {
            return false;
        }
    }

    removeExchange(id) {
        // Close any connections the exchange has
        delete this.instances[id];
    }
}

module.exports = ExchangeManager;
