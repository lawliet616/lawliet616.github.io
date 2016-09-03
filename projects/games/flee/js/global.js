/**
 * Created by Valentin on 2016.02.23..
 */
var m = m || {};

m.global= function() {
    var displayWidth = 1280,
        displayHeight = 720,
        unit = 20,
        debug = true;

    return{
        unit: unit,
        debug: debug,
        displayWidth: displayWidth,
        displayHeight: displayHeight
    }
}();