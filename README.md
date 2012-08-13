## Randy
#### Randy is a country singer that sends notifications, drives a Trans Am, and is one serious bad ass.

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
    options:    null
}, function (err) {
    // I'll shoot you with my invisible gun!
});
```

### Submitting A Notification
A minimal notification is just simply a message that will be emitted immediately to all users and will not require a "dismiss" action:
```javascript
var randy   = require('randy');
randy.submit({
    message:    'Shout it from the rooftops!'
}, function (err) {
    // Heeeeeee hawwwwwwww! 
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
    // Heeeeeee hawwwwwwww! 
});
```

### Client Setup
The client side is vanilla [socket.io](http://socket.io/) and only requires handling of three actions (register, notice, and dismiss). For example:

```javascript
var socket  = io.connect('//localhost');
var user    = 'test::user1234';

// Emit the "register" event with a unique user id and type (optional).
socket.emit('register', user);

// If a notice is received, display it!
socket.on('notice', function (notice) {
    alert(JSON.stringify(notice));

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
    "persist": false,
    "target": "test::1234",
    "message": "Hello World"
}
```

```json
{
    "id": "beb62c35-252e-44ec-9083-fd44a1e51a9f",
    "stamp": "2012-08-13T15:06:40.097Z",
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