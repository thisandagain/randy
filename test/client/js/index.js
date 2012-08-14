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
    var user        = 'test::1234';
    if (Math.floor(Math.random() * 3) % 2) {
        user        = 'test::' + Math.floor(Math.random()*99999);
    }
    $user.html(user);
    $('#target').val(user);

    /**
     * Socket.io events
     */
    //var socket = io.connect('//localhost:80');
    var socket = io.connect('//randy.jit.su:80');
    socket.emit('register', user);

    socket.on('notice', function (data) {
        $activity.prepend('<p>' + JSON.stringify(data) + '</p>');
        $activity.find('p').first().prepend('<a href="#" class="dismiss" id="' + data.id + '">Dismiss</a>&nbsp;');
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

    $('a.dismiss').live('click', function (e) {
        e.preventDefault();

        socket.emit('dismiss', {
            id:     $(this).attr('id'),
            uid:    user
        });

        $(this).parent().css('display', 'none');
    });

});
