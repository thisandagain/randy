/**
 * Randy is a country singer that sends notifications, drives a Trans Am, and is one serious bad ass.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var async   = require('async'),
    redis   = require('redis');

var randy   = require('./lib/index.js');

/**
 * Setup
 */
var client  = redis.createClient();

/**
 * Server
 */
async.auto({

    // Connect to redis
    // ------------------------------------------
    connect:    function (callback) {
        var client = redis.createClient();
        randy.connect(client, callback);
    },

    // Channel subscriptions
    // ------------------------------------------
    global:     ['connect', function (callback) {
        randy.subscribe('global', callback);
    }],

    makers:     ['connect', function (callback) {
        randy.subscribe('makers', callback);
    }],

    parents:    ['connect', function (callback) {
        randy.subscribe('parents', callback);
    }]

}, function (err, obj) {
    if (err) {
        throw new Error(err);
    } else {
        var port = process.env.PORT || 80;
        randy.listen(port);

        console.log('Randy is listening on port', port);
    }
});