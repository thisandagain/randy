/**
 * Test suite
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var async   = require('async'),
    test    = require('tap').text;

    target  = require(__dirname + '/../lib/index.js');

/**
 * Suite
 */
async.auto({

    emit:  function (callback) {
        target.emit(callback);
    },

    test:   ['emit', function (callback, obj) {
        test("Component definition", function (t) {
            t.type(target, "object", "Component should be an object");
            t.type(target.emit, "function", "Method should be a function");
            t.end();
        });

        test("emit method", function (t) {
            t.type(obj.all, "object", "Results should be an object");
            t.end();
        });

        callback();
    }]

}, function (err, obj) {
    test("Catch errors", function (t) {
        t.equal(err, null, "Errors should be null");
        t.end();
        process.exit();
    });
});