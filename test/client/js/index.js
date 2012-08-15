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
    var $notice     = $('#message-sent');

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
        $activity.find('p').first().prepend('<a href="#" class="read" id="' + data.id + '">Read</a>&nbsp;');
    
        if (data.read) {
            $activity.find('p').first().css('opacity', '0.5');
        }
    });

    /**
     * UI events
     */
    $('button').click(function (e) {
        e.preventDefault();
        
        var notice = {
            persist:    $('#input-persist').val(),
            target:     $('#input-target').val(),
            message:    $('#input-message').val()
        };

        if ($('#input-json').is(':checked')) {
            try {
                notice.message = JSON.parse(notice.message);
            } catch (e) {
                alert('Hold up, partner. Your message must be valid JSON.');
                return;
            }
        }

        socket.emit('loopback', notice);

        $notice.stop().css({opacity: 1}).html('Message sent!').show();
        window.setTimeout(function() {
            $notice.stop().animate({opacity: 0}, 2000);
        }, 5000);
    });

    $('a.read').live('click', function (e) {
        e.preventDefault();

        socket.emit('read', {
            id:     $(this).attr('id'),
            uid:    user
        });

        $(this).parent().css('opacity', '0.5');
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
