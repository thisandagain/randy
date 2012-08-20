## Randy
#### Randy is a country singer that sends notifications, drives a Trans Am, and will shoot you with his invisble gun.

[![Build Status](https://secure.travis-ci.org/thisandagain/randy.png?branch=master)](http://travis-ci.org/thisandagain/randy)

### Installation
```bash
npm install randy
```

### Server Setup
Randy setup is rather simple. To get a notifications server up and running simply:
```javascript
var randy   = require('randy');
randy.listen(80, function (err) {
    // Let's do this!
});
```

Optionally, you can pass in Redis connection settings (see Matt Ranney's [Redis](https://github.com/mranney/node_redis) module for details):
```javascript
var randy   = require('randy');
randy.listen(80, {
    port:       3333,
    host:       '127.0.0.1',
    pass:       'wildturkey',
    options:    null
}, function (err) {
    // Jump the general lee off a cliff
});
```

### Submitting A Notification
A minimal notification is just simply a message that will be emitted immediately to all users and will not require a "dismiss" action:
```javascript
var randy   = require('randy');
randy.submit({
    message:    'Shout it from the rooftops!'
}, function (err) {
    // Yeeeeeee hawwwwwwww! 
});
```

Optionally, both a `target` and the `persist` flag can be specified to send a notification to a single user and/or require a `dismiss` action:
```javascript
var randy   = require('randy');
randy.submit({
    message:    'Psst. Hey... wanna party?',
    target:     'guest::user1234',
    persist:    true
}, function (err) {
    // Trans Am! 
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

### Notice Model
Notices follow a very simple convention allowing for arbitrary extension through the "message" object:
```json
{
    "id": "beb62c35-252e-44ec-9083-fd44a1e51a9f",
    "stamp": "2012-08-13T15:06:40.097Z",
    "read": false,
    "persist": false,
    "target": "test::1234",
    "message": "Hello World"
}
```

```json
{
    "id": "beb62c35-252e-44ec-9083-fd44a1e51a9f",
    "stamp": "2012-08-13T15:06:40.097Z",
    "read": true,
    "persist": false,
    "target": "test::1234",
    "message": {
        "foo": "bar",
        "nyan": "cat",
        "country": {
            "music": "rules"
        }
    }
}
```

---

### Methods
- `listen`
- `submit`
- `destroy`

### Party Methods
- `party` (listen)
- `beerme` (submit)
- `passout` (destroy)

### Socket.io Actions (Incoming)
- `notice`

### Socket.io Actions (Outgoing)
- `register`
- `read`
- `dismiss`