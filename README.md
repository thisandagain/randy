## Randy
#### Socket.io based realtime notifications with [Rodeo](https://github.com/thisandagain/rodeo).

[![Build Status](https://secure.travis-ci.org/thisandagain/randy.png?branch=master)](http://travis-ci.org/thisandagain/randy)

### Installation
```bash
npm install node-randy
```

### Server Setup
Randy setup is rather simple. To get a notifications server up and running simply:
```javascript
var randy   = require('node-randy');
randy.listen(80, function (err) {
    // Let's do this!
});
```

Optionally, you can pass in Redis connection settings (see Matt Ranney's [Redis](https://github.com/mranney/node_redis) module for details):
```javascript
var randy   = require('node-randy');
randy.listen(80, {
    port:       3333,
    host:       '127.0.0.1',
    pass:       'wildturkey',
    options:    null
}, function (err) {
    // Jump the general lee off a cliff
});
```

### Client Setup
The client side is vanilla [socket.io](http://socket.io/) and only requires handling of three actions: `register`, `notice`, and `dismiss` (and `read` optionally). For example:

```javascript
var socket  = io.connect('//localhost');
var user    = 'test::user1234';

// Emit the "register" event with a unique user id and type (optional).
socket.emit('register', user);

// If a notice is received, display it!
socket.on('notice', function (notice) {
    alert(JSON.stringify(notice));

    // You can flag a persistent notice as "read", by emitting the "read" action
    socket.emit('read', {
        id:     notice.id,
        uid:    user
    });

    // In order to remove a persistent notice, you need to emit the "dismiss" action
    socket.emit('dismiss', {
        id:     notice.id,
        uid:    user
    });
});
```

---

### Methods
- `listen`

### Socket.io Actions (Incoming)
- `notice`

### Socket.io Actions (Outgoing)
- `register`
- `read`
- `dismiss`

---

### To Test
```bash
npm test
```