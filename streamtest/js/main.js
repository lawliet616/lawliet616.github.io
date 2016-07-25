$(document).ready(function($) {

    var isRunning = false;
    var btnstart = $("#button");
    var message = $("#message");

    btnstart.click(function(event) {
        StreamyAPI.onToggleStreaming();
        isRunning = !isRunning;
        toogleText(isRunning);

    });

    $(window).on('onstreamystreamerror', function(e) {
        message.css('color', 'red');
        message.text(e.detail.message);
        console.error("Error: " + e.detail.message);
        isRunning = false;
        toogleText(isRunning);
    });

    $(window).on('onstreamystreamsuccess', function(e) {
        message.css('color', 'green');
        message.text(e.detail.message);
        console.log("Succes: " + e.detail.message);
    });
        
    function toogleText(b){
        if(b){
            btnstart.text('Stop')
        } else {
             btnstart.text('Start')
        }
    }

});


