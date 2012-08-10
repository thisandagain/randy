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
 * Private methodslkjhasdf
 */
var something = function () {

};

// --------------------------------
// --------------------------------

/**
 * Constructor
 */
function Randy () {
    var self = this;
};

/**
 * Subscribe to notifications from a specified redis store.
 *
 * @param {Object} A redis connection
 *
 * @return {Boolean}
 */
Randy.prototype.subscribe = function (redis, callback) {
    var self = this;

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
 * Destroy the socket.io connection and redis subscription.
 *
 * @return {void}
 */
Randy.prototype.destroy = function () {
    // You blew it up!
};

/**
 * Export
 */
module.exports = new Randy();