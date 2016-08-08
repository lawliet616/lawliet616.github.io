$(document).ready(function($) {
    if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

    console.log = function(message) {
        console.olog(message);
        $('#content').append('<p class="msg">' + message + '</p>');
    };
    console.error = console.debug = console.info =  console.log

    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange; 

    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      hidden = "mozHidden";
      visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    // If the page is hidden, pause the video;
    // if the page is shown, play the video
    function handleVisibilityChange() {
      if (document[hidden]) {
        console.log(getTime() + " hidden");
      } else {
        console.log(getTime() + " shown");
      }
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || 
      typeof document[hidden] === "undefined") {
        console.error("Page Visibility API isn't supported");
    } else {
      // Handle page visibility change   
      document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
    
    function getTime(){
      var d = new Date();
      return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }
});
