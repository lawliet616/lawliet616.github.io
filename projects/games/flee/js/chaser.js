/**
 * Created by Valentin on 2016.02.24..
 */
var m = m || {};

m.chaser = function () {
    var defaultColor = "#C02942",
        defaultSpeed = 2;

    var color = defaultColor,
        speed = defaultSpeed,
        multiplier = 1;

    var distX,
        distY,
        dx,
        dy,
        angle;

    var x,
        y,
        w,
        h;

    var init = function () {
        w = m.global.unit;
        h = m.global.unit;
        x = m.global.displayWidth / 4 - w / 2;
        y = m.global.displayHeight / 4 - h / 2;
        multiplier = 1;
        if (m.global.debug) console.log("chaser added");
    };

    var update = function (player) {
        distX = player.x - x;
        distY = player.y - y;

        dx = distX < 0 ? -1 : 1;
        dy = distY < 0 ? -1 : 1;

        angle = Math.atan(Math.abs(distY / distX));

        dx *= Math.cos(angle) * defaultSpeed * multiplier;
        dy *= Math.sin(angle) * defaultSpeed * multiplier;

        x += dx;
        y += dy;

        if (m.utils.rectIntersection({x: x, y: y, w: w, h: h}, player)) {
            m.game.stopGame();
        }
    };

    var draw = function (ctx) {
        m.utils.drawRect(ctx, {
            x: x,
            y: y,
            w: w,
            h: h
        }, color);
    };

    return {
        draw: draw,
        init: init,
        update: update,
        getMultiplier: function () {
            return multiplier;
        },
        setMultiplier: function (m) {
            multiplier = m;
        },
        setColor: function (c) {
            if (c == "default") {
                color = defaultColor;
            } else {
                color = c;
            }
        }
    }
}();