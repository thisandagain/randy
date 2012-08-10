/**
 * Randy is a country singer that sends notifications, drives a Trans Am, and is one serious bad ass.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var _       = require('underscore'),
    async   = require('async'),
    io      = require('socket.io');

/**
 * Constructor
 */
function Randy () {
    var self = this; 
};

/**
 * Subscribe to notifications from a specified redis store.
 *
 * @param {Object} Redis connection settings
 *
 * @return {Boolean}
 */
Randy.prototype.subscribe = function (options, callback) {
    callback();
};

/**
 * Start listening for connections on the specified port.
 *
 * @param {Number} Port
 *
 * @return {void}
 */
Randy.prototype.listen = function (port) {
    io.listen(port);
};

/**
 * Export
 */
module.exports = new Randy();