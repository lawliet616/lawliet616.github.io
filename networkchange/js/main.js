$(document).ready(function($) {

    console.log(navigator);

    var supported = $("#supported");
    var type = $("#type");

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

    if(connection == null) {
        supported.text("NetworkInformation API not supported");
    } else {
        supported.text("NetworkInformation API supported");
        
        function changeHandler(){
            console.log(connection.type);
            type.text('Connection type: ' + connection.type);
        }

        changeHandler();
        connection.addEventListener('typechange', changeHandler);
        connection.addEventListener('change', changeHandler);
    }

});
