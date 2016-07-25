$(document).ready(function($) {

    var btnstart = $("#button");
    var btnstop = $("#button2");
    var message = $("#message");

    btnstart.click(function(event) {
        StreamyAPI.onStartStreaming();
    });

    btnstop.click(function(event) {
        StreamyAPI.onStopStreaming();
    });

    $(window).on('onstreamystreamerror', function(e) {
        message.css('color', 'red');
        message.text(e.detail.message);
        console.error("Error: " + e.detail.message);
    });

    $(window).on('onstreamystreamsuccess', function(e) {
        message.css('color', 'green');
        message.text(e.detail.message);
        console.log("Succes: " + e.detail.message);
    });

});


