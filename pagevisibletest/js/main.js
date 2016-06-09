$(document).ready(function($) {
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

    $("#content").text(hidden + " " + visibilityChange);
    console.log(hidden + " " + visibilityChange);
    console.log(hidden, visibilityChange);

    // If the page is hidden, pause the video;
    // if the page is shown, play the video
    function handleVisibilityChange() {
      if (document[hidden]) {
        console.log("Page is hidden");
      } else {
        console.log("Page is shown");
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
});
