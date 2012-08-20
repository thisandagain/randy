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
    test    = require('tap').test,

    target  = require(__dirname + '/../lib/index.js');

/**
 * Suite
 */
async.auto({

    test:   function (callback, obj) {
        test("Component definition", function (t) {
            t.type(target, "object", "Component should be an object");
            t.type(target.listen, "function", "Method should be a function");
            t.type(target.submit, "function", "Method should be a function");
            t.type(target.destroy, "function", "Method should be a function");

            t.type(target.party, "function", "Method should be a function");
            t.type(target.beerme, "function", "Method should be a function");
            t.type(target.passout, "function", "Method should be a function");
            t.end();
        });

        callback();
    }

}, function (err, obj) {
    test("Catch errors", function (t) {
        t.equal(err, null, "Errors should be null");
        t.end();
        process.exit();
    });
});