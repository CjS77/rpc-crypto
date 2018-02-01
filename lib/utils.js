const logger = require('./logging');

function toSnakeCase(s) {
    if (!s) { return s; }
    return s.replace(/([A-Z])/g, x => `_${x.toLowerCase()}`);
}

function toCamelCase(s) {
    if (!s) { return s; }
    return s.replace(/(_.)/g, x => x[1].toUpperCase());
}

function objToSnakeCase(obj) {
    if (!obj) {
        return obj;
    }
    const result = {};
    Object.keys(obj).forEach(key => {
        const scKey = toSnakeCase(key);
        result[scKey] = obj[key];
    });
    return result;
}

function objToCamelCase(obj) {
    if (!obj) {
        return obj;
    }
    const result = {};
    Object.keys(obj).forEach(key => {
        const scKey = toCamelCase(key);
        result[scKey] = obj[key];
    });
    return result;
}

function exit(msg, code = 0) {
    const level = code === 0 ? 'info' : 'error';
    logger.log(level, msg);
    process.exit(code);
}

module.exports = {
    toCamelCase, toSnakeCase, objToSnakeCase, objToCamelCase, exit
};
