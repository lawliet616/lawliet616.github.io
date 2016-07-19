$(document).ready(function($) {

    var supported = $("#supported");
    var oldtype = $("#old-type");
    var bandwith = $("#old-bandwith");
    var type = $("#new-type");

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

    if(connection == null) {
        supported.text("API not supported");
    } else if ('metered' in connection) {
        supported.text("Old API supported");

        oldtype.removeClass('hidden');
        bandwith.removeClass('hidden');
        
        function changeHandler(){
            bandwith.text(connection.bandwidth);
            oldtype.text((connection.metered ? '' : 'not ') + 'metered');
            console.log(connection.type);
        }

        changeHandler();
        connection.addEventListener('typechange', changeHandler);
        connection.addEventListener('change', changeHandler);

    } else {
        console.log(connection);
        supported.text("API supported");

        type.removeClass('hidden');
        
        function changeHandler(){
            type.text(connection.type);
            console.log(connection.type);
        }

        changeHandler();
        connection.addEventListener('typechange', changeHandler);
        connection.addEventListener('change', changeHandler);
    }

});
