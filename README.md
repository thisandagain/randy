## Randy
#### Randy is a country singer that sends notifications, drives a Trans Am, and is one serious bad ass.

### Server Setup
Randy setup is rather simple. To get a notifications server up and running simply:
```javascript
var randy   = require('randy');
randy.listen(port, function (err) {
    // Let's do this!
});
```

### Registering A Notification
A minimal notification is just simply a message that will be emitted immediately to all users and will not require a "dismiss" action:
```javascript
var randy   = require('randy');
randy.register({
    message:    'Shout it from the rooftops!'
}, function (err) {
    // Heeeeeee hawwwwwwww! 
});
```

Optionally, both a target and the `persist` flag can be specified to send a notification to a single user that will require the "dismiss" action:
```javascript
var randy   = require('randy');
randy.register({
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
var socket = io.connect('//localhost');

// Emit the "register" event with a unique user id and type (optional).
socket.emit('register', {
    id:     'user1234',
    type:   'guest'
});

// If a notice is recieved, display it!
socket.on('notice', function (notice) {
    alert(JSON.stringify(notice));

    // In order to remove a persistent notice, you need to emit the "dismiss" action
    socket.emit('dismiss', notice.id);
});
```