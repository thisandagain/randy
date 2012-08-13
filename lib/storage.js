/**
 * Data storage helper using hashes.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var _       = require('underscore'),
    async   = require('async');

var Util    = require('./util');

/**
 * Constructor
 */
function Storage (client) {
    this.client = client;
};

/**
 * Fetches all objects by hash id from the datastore.
 *
 * @param {String} Hash id
 * @param {String} Object id
 *
 * @return {Object}
 */
Storage.prototype.all = function (hash, callback) {
    var self = this;

    self.client.hgetall(hash, function (err, obj) {
        if (err) return callback(err);
        Util.parse(obj, callback);
    });
};

/**
 * Fetches an object by id from the datastore.
 *
 * @param {String} Hash id
 * @param {String} Object id
 *
 * @return {Object}
 */
Storage.prototype.get = function (hash, key, callback) {
    var self = this;

    self.client.hget(hash, key, function (err, obj) {
        if (err) return callback(err);
        Util.parse(obj, callback);
    });
};

/**
 * Pushes a new K/V pair into a hash.
 *
 * @param {String} Hash
 * @param {String} Key
 * @param {Object} Value
 *
 * @return {Error}
 */
Storage.prototype.set = function (hash, key, value, callback) {
    var self = this;

    Util.stringify(value, function (err, obj) {
        if (err) return callback(err);
        self.client.hmset(hash, {
            key: obj
        });

        return callback(null);
    });
};

/**
 * Deletes a K/V pair from a hash.
 *
 * @param {String} Hash
 * @param {String} Key
 *
 * @return {Error}
 */
Storage.prototype.del = function (hash, key, callback) {
    var self = this;

    self.client.hdel(hash, key, callback);
};

/**
 * Export
 */
module.exports = Storage;