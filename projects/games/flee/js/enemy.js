/**
 * Created by Valentin on 2016.02.22..
 */
var m = m || {};

m.enemy = function () {
    var interval = 3000;

    var defaultColor = "#F38630",
        multiplier = 1;

    var color = defaultColor;

    var maxSpeed = 2;

    var enemies;
    var token;

    var init = function () {
        if (token != null) clearInterval(token);
        enemies = [];
        addEnemy();
        token = setInterval(addEnemy, interval);

        if(m.global.debug) console.log("enemy init");
    };

    var addEnemy = function () {
        var player = m.player.getBody(),
            w = m.utils.round(m.utils.random(m.global.unit, 2 * m.global.unit)),
            h = w,
            x = m.utils.round(m.utils.random(0, m.global.displayWidth - w)),
            y = m.utils.round(m.utils.random(0, m.global.displayHeight - h)),
            velX = m.utils.round(m.utils.randomChoice(1, -1) * m.utils.random(maxSpeed / 2, maxSpeed)),
            velY = m.utils.round(m.utils.randomChoice(1, -1) * m.utils.random(maxSpeed / 2, maxSpeed));

        var rangeBox = {
            x: player.x - m.global.unit,
            y: player.y - m.global.unit,
            w: m.global.unit * 3,
            h: m.global.unit * 3
        };

        var enemy = {
            x: x,
            y: y,
            w: w,
            h: h,
            velX: velX,
            velY: velY
        };

        while (m.utils.rectIntersection(rangeBox, enemy)) {
            if(m.global.debug) console.log("enemy changed");
            x = m.utils.round(m.utils.random(0, m.global.displayWidth - w));
            y = m.utils.round(m.utils.random(0, m.global.displayHeight - h));
            enemy.x = x;
            enemy.y = y;
        }

        enemies.push(enemy);

        if(m.global.debug) console.log("enemy added");
    };

    var drawAll = function (ctx) {
        enemies.forEach(function (enemy) {
            m.utils.drawRect(ctx, enemy, color);
        });
    };


    var updateAll = function (player) {
        enemies.forEach(function (enemy) {
            if (0 >= enemy.x) {
                enemy.velX *= -1;
                enemy.x = 0;
            }
            if (enemy.x + enemy.w >= m.global.displayWidth) {
                enemy.velX *= -1;
                enemy.x = m.global.displayWidth - enemy.w;
            }
            if (0 >= enemy.y) {
                enemy.velY *= -1;
                enemy.y = 0;
            }
            if (enemy.y + enemy.h >= m.global.displayHeight) {
                enemy.velY *= -1;
                enemy.y = m.global.displayHeight - enemy.h;
            }

            enemy.x += enemy.velX * multiplier;
            enemy.y += enemy.velY * multiplier;

            if (m.utils.rectIntersection(enemy, player)) {
                m.game.stopGame();
            }
        });
    };

    var clear = function(){
        if (token != null) clearInterval(token);
    };

    return {
        getInterval: function () {
            return interval;
        },
        drawAll: drawAll,
        updateAll: updateAll,
        init: init,
        clear: clear,
        setInterval: function (ms) {
            interval = ms;
        },
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
