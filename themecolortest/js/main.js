$(document).ready(function($) {
    var colorPicker = $("#colorPicker");
    var setTheme = $("#setTheme");
    var valueInput = $("#valueInput");

    var metas = document.getElementsByTagName('meta'); 
    var meta;
    for (var i=0; i<metas.length; i++) { 
        if (metas[i].getAttribute("name") == "theme-color") { 
            meta = metas[i];
            break;
        } 
    } 

    function updateMetaThemeColor(theme) {
        meta.setAttribute("content", theme);
    }

    setTheme.click(function(event) {
       updateMetaThemeColor("#"+valueInput.val());
       console.log(valueInput.val());
    });
});
