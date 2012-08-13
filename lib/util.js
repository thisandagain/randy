/**
 * Safe utility methods.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Constructor
 */
function Util () {};

/**
 * Safe object to JSON string encoder.
 *
 * @param {Object} Input
 *
 * @return {String}
 */
Util.prototype.stringify = function (obj, callback) {
    try {
        callback(null, JSON.stringify(obj));
    } catch (err) {
        callback(err);
    }
};

/**
 * Safe JSON string to object decoder.
 *
 * @param {String} Input
 *
 * @return {Object}
 */
Util.prototype.parse = function (obj, callback) {
    try {
        callback(null, JSON.parse(obj));
    } catch (err) {
        callback(err);
    }
};

/**
 * Export
 */
module.exports = new Util();