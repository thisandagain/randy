/**
 * Notifications system server front-end.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var async   = require('async'),
    randy   = require('./lib/index.js');

/**
 * Server
 */
async.auto({

    // Start listening
    // ------------------------------------------
    listen:     function (callback) {
        var port = process.env.PORT || 80;
        randy.listen(port, function (err) {
            if (err) {
                callback(err);
            } else {
                console.log('Randy is listening on port', port);
                callback(null);
            }
        });
    }

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