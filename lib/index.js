/**
 * Socket.io based realtime notifications with Rodeo.
 *
 * @package randy
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var sio     = require('socket.io'),
    rodeo   = require('rodeo');

/**
 * Generic console logger.
 *
 * @param {String} Input
 *
 * @return {void}
 */
function stdout (input) {
    if (input) {
        console.log('Randy: ' + input);
    }
}

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

// --------------------------------

/**
 * Constructor
 */
function Randy () {
    var self = this;

    // Setup
    self.io             = null;
    self.sockets        = new Object(null);
    self.allowLoopback  = (process.env.NODE_ENV !== 'production');

    // Event handler
    rodeo.on('message', function (message) {
        getSocket(message.target, function (err, socket) {
            if (!err) emit(socket, message);
        });
    });

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
                console.log('Socket not found for target: ' + target);
            }
        }
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
            rodeo.all(id, function (err, obj) {
                if (err) {
                    stdout(err);
                } else {
                    for (var i = 0; i < obj.length; i++) {
                        emit(socket, obj[i]);
                    }
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
            rodeo.read(data.uid, data.id, stdout);
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
            rodeo.dismiss(data.uid, data.id, stdout);
        });

        /**
         * Submits a new event via the loopback interface.
         *
         * @param {Object} Notification object (see "register" method).
         *
         * @return {void}
         */
        socket.on('loopback', function (data) {
            if (self.allowLoopback) {
                rodeo.submit(data, stdout);
            }
        });
    };
};

/**
 * Start listening for connections on the specified port.
 *
 * @param {Number} Port
 * @param {Object} Connection arguments
 *
 * @return {Error}
 */
Randy.prototype.listen = function (port, arg, callback) {
    var self = this;

    if (typeof callback === 'undefined') {
        callback    = arg;
        arg         = {};
    };

    rodeo.listen(arg, function (err) {
        if (err) return callback(err);

        self.io = sio.listen(Number(port));
        if (process.env.NODE_ENV === 'production') {
            self.io.enable('browser client minification');
            self.io.enable('browser client etag');
            self.io.enable('browser client gzip'); 
            self.io.set('log level', 1);
            io.set('transports', [
                'websocket',
                'htmlfile',
                'xhr-polling',
                'jsonp-polling'
            ]);
        }
        self.io.sockets.on('connection', self.connection);

        callback(null);
    });
};

// --------------------------------
// --------------------------------

/**
 * Export
 */
module.exports = new Randy();
