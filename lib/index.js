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
    redis   = require('redis'),
    sio     = require('socket.io'),
    uuid    = require('node-uuid');

/**
 * Private methods
 */
function hash (obj, callback) {
    try {
        callback(null, JSON.stringify(obj));
    } catch (err) {
        callback(err);
    }
}

function parse (string, callback) {
    try {
        callback(null, JSON.parse(string));
    } catch (err) {
        callback(err);
    }
}

function emitter (socket, notice) {
    socket.emit('notice', notice);
}

// --------------------------------

/**
 * Constructor
 */
function Randy () {
    var self = this;

    // Setup
    self.ns         = 'randy';
    self.pub        = redis.createClient();
    self.sub        = redis.createClient();
    self.io         = null;
    self.sockets    = new Object(null);

    /**
     * Subscription "message" event handler.
     *
     * @param {String} Channel
     * @param {String} Data
     *                  - message {String, Required}
     *                  - target {String, Default=null}
     *                  - type {String, Default=live}
     *
     * @return {void}
     */
    self.listener   = function (channel, data) {
        parse(data, function (err, obj) {
            if (err) { 
                throw new Error(err);
            } else {
                self.io.sockets.emit('notice', obj);
            }
        });
    };

    /**
     * Socket.io "connection" event handler.
     *
     * @param {Object} Socket
     *
     * @return {void}
     */
    self.connection = function (socket) {

        /**
         * Registers a socket to begin recieving notifications.
         *
         * @param {Object} Generic data object
         *                      - id {Number, Required}
         *                      - type {String, Required}
         *
         * @return {void}
         */
        socket.on('register', function (data) {
            // ID
            var id = data.type + '::' + data.id;

            // Check existing
            if (typeof self.sockets[id] === 'undefined') {
                self.sockets[id] = {
                    id:         socket.id,
                    socket:     socket,
                    storage:    {
                        '982734981': {"persist":"false","target":"test::71351","message":"it works!"}
                    }
                };
            }

            // Emit from storage
            for (var item in self.sockets[id].storage) {
                self.sockets[id].socket.emit('notice', self.sockets[id].storage[item]);
            }
        });

        /**
         * Dismisses a persistent notification.
         *
         * @param {String} Notification id
         *
         * @return {void}
         */
        socket.on('dismiss', function (data) {
            console.dir(data);
        });

        /**
         * Registers a new event via the loopback interface.
         *
         * @param {Object} Notification object (see "register" method).
         *
         * @return {void}
         */
        socket.on('loopback', function (data) {
            self.register(data, function (err) {
                console.log(err);
            });
        });
    };
};

/**
 * Start listening for connections on the specified port.
 *
 * @param {Number} Port
 *
 * @return {Error}
 */
Randy.prototype.listen = function (port, callback) {
    var self = this;

    try {
        // Redis
        self.sub.subscribe(self.ns);
        self.sub.on('message', self.listener);

        // Socket.io
        self.io = sio.listen(port);
        self.io.sockets.on('connection', self.connection);
        callback(null);
    } catch (err) {
        callback(err);
    }
};

/**
 * Destroy the socket.io connection and redis subscription(s).
 *
 * @return {Error}
 */
Randy.prototype.destroy = function (callback) {
    var self = this;

    try {
        self.sub.unsubscribe();
        callback(null);
    } catch (err) {
        callback(err);
    }
};

/**
 * Registers a new notification.
 *
 * @param {Object} Notification
 *                  - message {String, Required}
 *                  - target {String, Default=null}
 *                  - persist {Boolean, Default=false}
 *
 * @return {Error}
 */
Randy.prototype.register = function (notice, callback) {
    var self = this;

    _.defaults(notice, {
        message:    null,
        target:     null,
        persist:    false
    });

    // If no message is specified, drop the request
    if (notice.message === null || notice.message === '') {
        callback('No message was specified.');
    }

    // Hash notice and publish to redis store
    async.auto({
        hash:       function (callback) {
            hash(notice, callback);
        },

        publish:    ['hash', function (callback, obj) {
            self.pub.publish(self.ns, obj.hash);
            callback();
        }]
    }, callback);
};

// --------------------------------
// --------------------------------

/**
 * Export
 */
module.exports = new Randy();