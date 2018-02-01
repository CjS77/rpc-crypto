/* eslint-disable camelcase */
const utils = require('../lib/utils');
const assert = require('assert');

describe('toCamelCase', () => {
    it('fooBar -> fooBar', () => {
        assert.equal(utils.toCamelCase('fooBar'), 'fooBar');
    });
    it('foo_bar -> fooBar', () => {
        assert.equal(utils.toCamelCase('foo_bar'), 'fooBar');
    });
    it('foo_Bar -> fooBar', () => {
        assert.equal(utils.toCamelCase('foo_bar'), 'fooBar');
    });

    it('foo_Bar.baz_bee -> fooBar.bazBee', () => {
        assert.equal(utils.toCamelCase('foo_bar.baz_bee'), 'fooBar.bazBee');
    });
    it('null -> null', () => {
        assert.equal(utils.toCamelCase(null), null);
    });
});

describe('tosnakeCase', () => {
    it('foo_bar -> foo_bar', () => {
        assert.equal(utils.toSnakeCase('foo_bar'), 'foo_bar');
    });
    it('fooBar -> foo_bar', () => {
        assert.equal(utils.toSnakeCase('fooBar'), 'foo_bar');
    });
    it('_fooBar -> _foo_bar', () => {
        assert.equal(utils.toSnakeCase('_fooBar'), '_foo_bar');
    });
    it('fooBar.bazBee -> foo_bar.baz_bee', () => {
        assert.equal(utils.toSnakeCase('fooBar.bazBee'), 'foo_bar.baz_bee');
    });
    it('null -> null', () => {
        assert.equal(utils.toSnakeCase(null), null);
    });
});

describe('object conversion', () => {
    let scObj;
    const ccObj = {
        apiKey: 'key',
        password: 'pw'
    };
    it('objToSnakeCase', () => {
        scObj = utils.objToSnakeCase(ccObj);
        assert.deepEqual(scObj, {
            api_key: 'key',
            password: 'pw'
        });
    });

    it('objToCamelCase', () => {
        const obj = utils.objToCamelCase(scObj);
        assert.deepEqual(obj, ccObj);
    });

    it('poor input', () => {
        assert.equal(utils.objToSnakeCase(), undefined);
        assert.equal(utils.objToSnakeCase(null), null);
        assert.deepEqual(utils.objToSnakeCase({}), {});
        assert.equal(utils.objToCamelCase(), undefined);
        assert.equal(utils.objToCamelCase(null), null);
        assert.deepEqual(utils.objToCamelCase({}), {});
    });
});
