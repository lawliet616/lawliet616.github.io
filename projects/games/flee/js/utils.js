/**
 * Created by Valentin on 2016.02.22..
 */
var m = m || {};

m.utils = function(){
    var random = function (min, max) {
        return (min + (Math.random() * (max - min)));
    };

    var randomChoice = function () {
        return arguments[Math.floor(random(0, arguments.length))];
    };

    var timeStamp = function () {
        return new Date().getTime();
    };

    var drawRect = function (ctx, rect, color) {
        if (color == undefined) color = "black";
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.w, rect.h);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    };

    var rectIntersection = function (rect1, rect2) {
        return rect1.x < rect2.x + rect2.w &&
               rect1.x + rect1.w > rect2.x &&
               rect1.y < rect2.y + rect2.h &&
               rect1.h + rect1.y > rect2.y;
    };

    var createCookie = function (name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    };

    var readCookie = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    };

    var eraseCookie = function (name) {
        createCookie(name,"",-1);
    };

    var isInt = function(value) {
        var x;
        if (isNaN(value)) {
            return false;
        }
        x = parseFloat(value);
        return (x | 0) === x;
    };

    var round = function (num, prec){
        if(prec == null) prec = 2;
        var c = Math.pow(10,prec);
        return Math.round(num * c) / c;
    };

    return{
        random: random,
        randomChoice: randomChoice,
        timeStamp: timeStamp,
        drawRect: drawRect,
        rectIntersection: rectIntersection,
        createCookie: createCookie,
        readCookie: readCookie,
        eraseCookie: eraseCookie.apply,
        isInt: isInt,
        round: round
    }
}();