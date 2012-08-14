/**
 * Notifications system server front-end.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var _       = require('underscore'),
    async   = require('async'),
    randy   = require('./lib/index.js');

/**
 * Server
 */
async.auto({

    // Defaults
    // ------------------------------------------
    defaults:   function (callback) {
        _.defaults(process.env, {
            PORT:       80,
            REDIS_HOST: null,
            REDIS_PORT: null,
            REDIS_PASS: null
        });

        callback();
    },

    // Start listening
    // ------------------------------------------
    listen:     ['defaults', function (callback) {
        randy.listen(process.env.PORT, function (err) {
            if (err) {
                callback(err);
            } else {
                console.log('Randy is listening on port', process.env.PORT);
                callback(null);
            }
        });
    }]

}, function (err, obj) {
    if (err) {
        throw new Error(err);
    }
});

/**
 * Process exit handler
 */
process.on('exit', function () {
    randy.destroy(function (err) {
        process.exit();
    });
});