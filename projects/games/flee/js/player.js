/**
 * Created by Valentin on 2016.02.22..
 */
var m = m || {};

m.player = function(){
    var defaultColor = "#69d2e7",
        defaultSpeed = 4;

    var color = defaultColor,
        speed = defaultSpeed,
        multiplier = 1;

    var up,
        down,
        left,
        right;

    var x,
        y,
        w,
        h;

    var init = function(){
        w = m.global.unit;
        h = m.global.unit;
        x = m.global.displayWidth / 2 - w / 2;
        y = m.global.displayHeight / 2 - h / 2;
        up = false;
        down = false;
        left = false;
        right = false;
    };

    var update = function(){
        if((up || down)&&(left || right)) speed = Math.sqrt(Math.pow(defaultSpeed,2)/2) * multiplier;
        else speed = defaultSpeed * multiplier;

        if(up){
            y -= speed;
        }
        if(down){
            y += speed;
        }
        if(left){
            x -= speed;
        }
        if(right){
            x += speed;
        }

        if(x < 0) x = 0;
        if(x > m.global.displayWidth - w) x = m.global.displayWidth - w;

        if(y < 0) y = 0;
        if(y > m.global.displayHeight - h) y = m.global.displayHeight - h;

    };

    var draw = function(ctx){
        m.utils.drawRect(ctx, {
            x: x,
            y: y,
            w: w,
            h: h}, color);
    };

    return{
        getBody:function(){
            return{
                x:x,
                y:y,
                w:w,
                h:h
            }
        },
        draw: draw,
        init: init,
        update: update,
        setUp: function(b){
            up = b;
        },
        setDown: function(b){
            down = b;
        },
        setLeft: function(b){
            left = b;
        },
        setRight: function(b){
            right = b;
        },
        getUp: function(){
            return up;
        },
        getDown: function(){
            return down;
        },
        getLeft: function(){
            return left;
        },
        getRight: function(){
            return right;
        },
        getMultiplier: function(){
            return multiplier;
        },
        setMultiplier: function(m){
            multiplier = m;
        },
        setColor: function(c){
            if(c == "default"){
                color = defaultColor;
            }else{
                color = c;
            }
        }
    }
}();