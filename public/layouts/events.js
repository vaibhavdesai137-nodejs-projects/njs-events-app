$(document).ready(function () {

    $('#deleteEvent').click(function (e) {
        var eventId = $('#deleteEvent').data('eventid');


        $.ajax({
            url: '/events/delete/' + eventId,
            type: 'DELETE',
            success: function (result) {
                window.location  = '/events/mine';
            }
        });
    });
});