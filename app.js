/**
 * Randy is a country singer that sends notifications, drives a Trans Am, and is one serious bad ass.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var randy   = require('./lib/index.js');

/**
 * Setup
 */
var redis   = {};
var port    = process.env.PORT || 80;

/**
 * Subscribe to datastore & start listening
 */
randy.subscribe(redis, function (err, obj) {
    if (err) {
        throw new Error(err);
    } else {
        randy.listen(port);
        console.log('Randy is listening on port', port);
    }
});