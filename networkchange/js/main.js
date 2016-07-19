$(document).ready(function($) {

    var supported = $("#supported");
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

    if(connection == null) {
        supported.text("API not supported");
    } else if ('metered' in connection) {
        supported.text("Old API supported");

        var type = $("#old-type");
        var bandwith = $("#old-bandwith");
        
        function changeHandler(){
            bandwith.text(connection.bandwidth);
            type.text((connection.metered ? '' : 'not ') + 'metered');
            console.log(connection.type);
        }

        changeHandler();
        connection.addEventListener('typechange', changeHandler);
        connection.addEventListener('change', changeHandler);

    } else {
        supported.text("API supported");

        var type = $("#new-type");
        
        function changeHandler(){
            type.text(connection.type);
            console.log(connection.type);
        }

        changeHandler();
        connection.addEventListener('typechange', changeHandler);
        connection.addEventListener('change', changeHandler);
    }
    
});
