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

var Util    = require('./util'),
    Storage = require('./storage');

/**
 * Generic socket emitter.
 *
 * @param {Object} Socket
 * @param {Object} Notice
 *
 * @return {void}
 */
function emit (socket, notice) {
    socket.emit('notice', notice);
}

/**
 * Generic redis connection adapter.
 *
 * @param {Object} Connection arguments.
 *
 * @return {Object}
 */
function adapter (arg, callback) {
    // Normalize types
    for (var item in arg) {
        arg[item] = (arg[item] === 'null') ? null : arg[item];
        arg[item] = (item === 'port') ? Number(arg[item]) : arg[item];
    }

    // Create client
    var client = redis.createClient(arg.port, arg.host, arg.options);

    // Authenticate
    if (arg.pass !== null) {
        client.auth(arg.pass, function (err, obj) {
            callback(err, client);
        });
    } else {
        callback(null, client);
    }
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
    self.store      = null;
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
                Util.stdout(err);
            }
        }
    };

    /**
     * Creates redis connection clients.
     *
     * @param {Object} Connection arguments
     *
     * @return {Err}
     */
    self.connect    = function (arg, callback) {
        _.defaults(arg, {
            port:       null,
            host:       null,
            pass:       null,
            options:    null
        });

        async.auto({
            connect:        function (callback) {
                var a = [];
                async.forEach([0,1,2], function (obj, callback) {
                    adapter(arg, function (err, b) {
                        a[obj] = b;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, a);
                });
            },

            assign:         ['connect', function (callback, obj) {
                self.store  = new Storage(obj.connect[0]);
                self.pub    = obj.connect[1];
                self.sub    = obj.connect[2];
                callback(null);
            }],
        }, callback);
    }

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
            decode:      function (callback) {
                Util.parse(data, callback);
            },

            socket:     ['decode', function (callback, obj) {
                getSocket(obj.decode.target, callback);
            }],

            emit:       ['socket', function (callback, obj) {
                emit(obj.socket, obj.decode);
            }]
        }, Util.stdout);
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
                    socket:     socket                
                };
            } else {
                self.sockets[id].id     = socket.id;
                self.sockets[id].socket = socket;
            }

            // Emit from storage
            self.store.all(id, function (err, obj) {
                if (err) {
                    callback(err);
                } else {
                    async.forEach(obj, function (a, callback) {
                        emit(socket, a);
                        callback();
                    }, Util.stdout);
                }
            });
        });

        /**
         * Modifies the "read" flag of a notification.
         *
         * @param {Object} Identity
         *                      - id {String, Required}
         *                      - uid {String, Required}
         *
         * @return {void}
         */
        socket.on('read', function (data) {
            self.store.get(data.uid, data.id, function (err, obj) {
                if (err) {
                    Util.stdout(err);
                } else {
                    obj.read = true;
                    self.store.set(data.uid, data.id, obj, Util.stdout);
                }
            });
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
            self.store.del(data.uid, data.id, Util.stdout);
        });

        /**
         * Submits a new event via the loopback interface.
         *
         * @param {Object} Notification object (see "register" method).
         *
         * @return {void}
         */
        socket.on('loopback', function (data) {
            self.submit(data, Util.stdout);
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

    if (_.isUndefined(callback)) {
        callback    = arg;
        arg         = {};
    };

    async.auto({
        connect:    function (callback) {
            if (self.pub === null || self.sub === null || self.store === null) {
                self.connect(arg, callback);
            } else {
                callback();
            }
        },

        pubsub:     ['connect', function (callback) {
            self.sub.subscribe(self.ns);
            self.sub.on('message', self.listener);
            callback(null);
        }],

        sockets:    ['connect', function (callback) {
            self.io     = sio.listen(Number(port));
            self.io.set('log level', 1);
            self.io.sockets.on('connection', self.connection);
            callback(null);
        }]
    }, callback);
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
Randy.prototype.submit = function (notice, arg, callback) {
    var self = this;

    if (_.isUndefined(callback)) {
        callback    = arg;
        arg         = {};
    };

    async.auto({
        connect:     function (callback) {
            if (self.pub === null || self.sub === null || self.store === null) {
                self.connect(arg, callback);
            } else {
                callback();
            }
        },
        submit:     ['connect', function (callback) {
            // Defaults
            _.defaults(notice, {
                id:         uuid.v4(),                  // Assign uuid
                stamp:      new Date().toJSON(),        // Timestamp
                persist:    false,
                read:       false,
                target:     null,
                message:    null
            });

            // Normalize typing
            notice.persist  = (notice.persist === 'true' || notice.persist === true) ? true : false;
            notice.target   = (notice.target === '') ? null : notice.target;

            // Persist
            if (notice.persist && notice.target !== null) {
                self.store.set(notice.target, notice.id, notice, Util.stdout);
            }

            // If no message is specified, drop the request
            if (notice.message === null || notice.message === '') {
                return callback('No message was specified.');
            }

            // Hash notice and publish to redis store
            async.auto({
                encode:     function (callback) {
                    Util.stringify(notice, callback);
                },

                publish:    ['encode', function (callback, obj) {
                    self.pub.publish(self.ns, obj.encode);
                    callback(null);
                }]
            }, callback);
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
        Util.stdout(err);
    }
};

// --------------------------------

/**
 * Method alias
 */
Randy.prototype.party = function () {
    this.listen.apply(this, arguments);
};

Randy.prototype.beerme = function () {
    this.submit.apply(this, arguments);
};

Randy.prototype.passout = function () {
    this.destroy.apply(this, arguments);
};

// --------------------------------
// --------------------------------

/**
 * Export
 */
module.exports = new Randy();
