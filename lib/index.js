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
function logError (err) {
    if (err) {
        console.log('Error: ' + err);
    }
}

function hash (obj, callback) {
    try {
        callback(null, JSON.stringify(obj));
    } catch (err) {
        logError(err);
    }
}

function parse (string, callback) {
    try {
        callback(null, JSON.parse(string));
    } catch (err) {
        logError(err);
    }
}

function emit (socket, notice) {
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
    self.pub        = null;
    self.sub        = null;
    self.io         = null;
    self.sockets    = new Object(null);

    /**
     * Gets the socket (if available) for the specified target.
     *
     * @param {String} Target
     *
     * @return {Object}
     */
    function getSocket (target, callback) {
        if (target === null || target === '') {
            callback(null, self.io.sockets);
        } else {
            try {
                callback(null, self.sockets[target].socket);
            } catch (err) {
                logError(err);
            }
        }
    };

    /**
     * Subscription "message" event handler.
     *
     * @param {String} Channel
     * @param {String} Notice (JSON String)
     *
     * @return {void}
     */
    self.listener   = function (channel, data) {
        async.auto({
            parse:      function (callback) {
                parse(data, callback);
            },

            socket:     ['parse', function (callback, obj) {
                getSocket(obj.parse.target, callback);
            }],

            emit:       ['socket', function (callback, obj) {
                emit(obj.socket, obj.parse);
            }]
        }, logError);
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
         * @param {String} Unique user id
         *
         * @return {void}
         */
        socket.on('register', function (id) {
            // Check if exists
            if (typeof self.sockets[id] === 'undefined') {
                self.sockets[id] = {
                    id:         socket.id,
                    socket:     socket,
                    storage:    {}
                };
            } else {
                self.sockets[id].id     = socket.id;
                self.sockets[id].socket = socket;
            }

            // Emit from storage
            var storage = self.sockets[id].storage;
            async.forEach(Object.keys(storage), function (obj, callback) {
                emit(socket, storage[obj]);
                callback();
            }, logError);
        });

        /**
         * Dismisses a persistent notification.
         *
         * @param {Object} Identity
         *                      - id {String, Required}
         *                      - uid {String, Required}
         *
         * @return {void}
         */
        socket.on('dismiss', function (data) {
            try {
                delete self.sockets[data.uid].storage[id];
            } catch (err) {
                logError(err);
            }
        });

        /**
         * Submits a new event via the loopback interface.
         *
         * @param {Object} Notification object (see "register" method).
         *
         * @return {void}
         */
        socket.on('loopback', function (data) {
            self.submit(data, logError);
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
Randy.prototype.listen = function (port, arg, callback) {
    var self = this;

    // Detect argument list
    if (_.isUndefined(callback)) {
        callback    = arg;
        arg         = {
            port:       null,
            host:       null,
            options:    null
        };
    };

    try {
        // Redis
        self.pub = redis.createClient(arg.port, arg.host, arg.options);
        self.sub = redis.createClient(arg.port, arg.host, arg.options);
        self.sub.subscribe(self.ns);
        self.sub.on('message', self.listener);

        // Socket.io
        self.io = sio.listen(port);
        self.io.set('log level', 1);
        self.io.sockets.on('connection', self.connection);
        callback(null);
    } catch (err) {
        logError(err);
    }
};

/**
 * Submits a new notification.
 *
 * @param {Object} Notification
 *                  - persist {Boolean, Default=false}
 *                  - target {String, Default=null}
 *                  - message {String, Required}
 *
 * @return {Error}
 */
Randy.prototype.submit = function (notice, callback) {
    var self = this;

    _.defaults(notice, {
        id:         uuid.v4(),                  // Assign uuid
        stamp:      new Date().toJSON(),        // Timestamp
        persist:    false,
        target:     null,
        message:    null
    });

    // Normalize typing
    notice.persist  = (notice.persist.toLowerCase() === 'true' || notice.persist === true) ? true : false;
    notice.target   = (notice.target === '') ? null : notice.target;

    // Persist
    // @note Incorrect... pending data storage
    if (notice.persist) {
        try {
            self.sockets[notice.target].storage[notice.id] = notice;
        } catch (err) {
            logError('Can not persist notifications without a target.');
        }
    }

    // If no message is specified, drop the request
    if (notice.message === null || notice.message === '') {
        return callback('No message was specified.');
    }

    // Hash notice and publish to redis store
    async.auto({
        hash:       function (callback) {
            hash(notice, callback);
        },

        publish:    ['hash', function (callback, obj) {
            self.pub.publish(self.ns, obj.hash);
            callback(null);
        }]
    }, callback);
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
        self.pub.end();
        self.sub.end();
        callback(null);
    } catch (err) {
        logError(err);
    }
};

// --------------------------------
// --------------------------------

/**
 * Export
 */
module.exports = new Randy();
