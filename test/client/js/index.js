/**
 * Test client logic.
 *
 * @package randy
 * @author Andrew Sliwinski
 */

$(document).ready(function() {

    /**
     * Setup
     */
    var $user       = $('#user', '#base');
    var $actions    = $('#actions', '#base');
    var $activity   = $('#activity', '#notifications');

    /**
     * Generate unique (random) user id
     */
    var user        = 'test::' + Math.floor(Math.random()*99999);
    $user.html(user);
    $('#target').val(user);

    /**
     * Socket.io events
     */
    var socket = io.connect('//localhost:80');
    socket.emit('register', user);

    socket.on('notice', function (data) {
        $activity.prepend('<p>' + JSON.stringify(data) + '</p>');
    });

    /**
     * UI events
     */
    $('button').click(function (e) {
        e.preventDefault();
        
        socket.emit('loopback', {
            persist:    $('#persist').val(),
            target:     $('#target').val(),
            message:    $('#message').val()
        });
    });

});
