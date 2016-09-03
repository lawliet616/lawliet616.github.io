/**
 * Created by Krasznai on 2015.06.28..
 */
"use strict";
// http://creativejs.com/resources/requestanimationframe/
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
        || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

(function Game() {

// <editor-fold desc="Utility">
    function projectileWallIntersection(projectile) {
        var speed = projectile.speed.y + gravity,
            distance = displayHeight - (projectile.y + projectile.r),
            frame = distance / speed;

        if (frame > 0 && frame < 1) {
            projectile.y = displayHeight - projectile.r;

            if (speed < 0.5 && projectile.speed.x < 1) {
                return {bounce: true, dx: 0.99, dy: -bounceFactor};
            }
            return {bounce: true, dx: bounceFactor, dy: -bounceFactor};
        }
        else {
            if (projectile.x - projectile.r <= 0) {
                projectile.x = projectile.r;
                return {bounce: true, dx: -bounceFactor, dy: bounceFactor};
            }
            if (projectile.x + projectile.r >= displayWidth) {
                projectile.x = displayWidth - projectile.r;
                return {bounce: true, dx: -bounceFactor, dy: bounceFactor};
            }
            if (projectile.y - projectile.r <= 0) {
                projectile.y = projectile.r;
                return {bounce: true, dx: bounceFactor, dy: -bounceFactor};
            }
            return {bounce: false};
        }
    }

    function fillAimingArray() {
        var ratio = maxProjectileSpeed * power / maxPower;
        testProjectile = {
            x: canon.tube.x + canon.tube.w / 2 + canon.tube.h * Math.sin(Math.PI * (degree / 180)),
            y: canon.tube.y + canon.tube.h - canon.tube.h * Math.cos(Math.PI * (degree / 180)),
            r: unit / 2 + defaultWidth / 2,
            speed: {
                x: ratio * (degree == 90 ? 0 : Math.sin(Math.PI * (degree / 180))),
                y: (ratio * Math.cos(Math.PI * (degree / 180))) * -1
            }
        };



        var i = 0;
        var frame = 0;
        var array = [];
        while (i < 20) {
            testProjectile.x += testProjectile.speed.x;
            testProjectile.y += testProjectile.speed.y;

            testProjectile.speed.y = testProjectile.speed.y + gravity;

            var x = projectileWallIntersection(testProjectile);
            if (x.bounce) {
                testProjectile.speed.y *= x.dy;
                testProjectile.speed.x *= x.dx;
            }
            if (Math.abs(testProjectile.speed.x) < 0.05) testProjectile.speed.x = 0;


            frame++;
            if (frame % 5 == 0) {
                array.push([testProjectile.x, testProjectile.y]);
                i++;
            }
        }

        return array;
    }

//</editor-fold

// <editor-fold desc="Global">
    var key = {
        SPACE: 32,
        UP: 38,
        DOWN: 40,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        A: 65,
        D: 68,
        P: 80,
        S: 83,
        W: 87
    };
    var color = {
        canonBase: "#D2D2D2",
        canonTube: "#D2D2D2",
        canonStroke: "grey",
        projectile: "#CC0000",
        powerLineStroke: "grey",
        powerLineFill: "#CC0000",
        footprints: "#DB4D4D",
        destination: "grey",
        aiming: "#CC0000",
        text: "#CCCCCC"
    };
    var font = {
        text: "bold 16px Arial",
        modeText: "bold 24px Arial",
        statText: "10px Arial",
        headerText: "bold 40px Arial",
        caption: "bold 52px Arial"
    };

    //Defaults
    var unit = 20;
    var defaultWidth = unit / 4;
    var maxProjectileSpeed = 2 * 11.5;
    var gravity = 0.2;
    var bounceFactor = 0.8;

    var displayWidth = 1280;
    var displayHeight = 720;

    var isPaused, mainLoopToken;

    var canon, degree, deltaDegree, minDegree, maxDegree, rotateDir;

    var powerBar, powerRect, dLevel, power, deltaPower, minPower, maxPower, powerCanChange, currentPower;

    var projectile, projectileExist;
    var testProjectile, testProjectileExist;

    var predictionChecked = false, footprintChecked = false, aimingChecked = true;

//</editor-fold
    var canvas, ctx;
    canvas = document.getElementById('canvas');
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    ctx = canvas.getContext('2d');

// <editor-fold desc="Draw">
    var drawControl = function () {
        if(isPaused) {

                ctx.fillStyle = color.text;
                ctx.font = font.headerText;
                ctx.fillText("press 'P' to START or PAUSE the game", 60, 100);

                ctx.fillStyle = color.text;
                ctx.font = font.modeText;
                ctx.fillText("press 'A' or 'D' to adjust the canon's angle", 60, 160);
                ctx.fillText("press 'SPACE' to adjust the power level", 60, 200);
                ctx.fillText("tick the checkboxes to get fancy functions", 60, 240);

        }
    };
    var drawRect = function (rect, fillStyle, strokeStyle, lineWidth) {
        if (lineWidth == undefined) lineWidth = defaultWidth;
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.w, rect.h);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
            if (lineWidth == undefined) lineWidth = defaultWidth;
            ctx.lineWidth = lineWidth;
            ctx.stroke()
        }
    };

    var drawCircle = function (circle, fillStyle, strokeStyle, lineWidth) {
        if (lineWidth == undefined) lineWidth = defaultWidth;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    };

    var drawCanonBase = function () {
        drawCircle(canon.base, color.canonBase, color.canonStroke);
    };

    var drawCanonTube = function (degree) {
        ctx.save();
        // move the rotation point to the bottom center of the rect
        ctx.translate(canon.tube.x + canon.tube.w / 2, canon.tube.y + canon.tube.h);
        // rotate the rect
        ctx.rotate(degree * Math.PI / 180);
        // move the rotation point back to the original
        ctx.translate(-(canon.tube.x + canon.tube.w / 2), -(canon.tube.y + canon.tube.h));

        drawRect(canon.tube, color.canonTube, color.canonStroke);

        ctx.restore();
    };

    var drawPowerLine = function () {
        ctx.beginPath();
        ctx.strokeStyle = color.powerLineStroke;
        ctx.lineWidth = unit / 4;
        ctx.strokeRect(powerBar.x, powerBar.y, powerBar.w, powerBar.h);
        ctx.closePath();

        powerRect = {
            x: powerBar.x + defaultWidth / 2,
            y: powerBar.y + defaultWidth / 2 + (maxPower - power) * dLevel,
            w: powerBar.w - defaultWidth,
            h: power * dLevel
        };

        drawRect(powerRect, color.powerLineFill);
    };

    var drawProjectile = function () {
        if (!projectileExist) return;
        drawCircle(projectile, color.projectile);
    };

    var drawProjectileDestination = function () {
        if (predictionChecked && projectileExist) {
            ctx.beginPath();
            ctx.arc(testProjectile.x, testProjectile.y, testProjectile.r, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.strokeStyle = color.destination;
            ctx.lineWidth = defaultWidth;
            ctx.stroke();
        }
    };

    var drawFootPrints = (function () {
        var i = 0;
        var frame = 0;
        var footprintsArray = [];
        return function () {
            if (!footprintChecked) {
                if (footprintsArray.length > 0) {
                    footprintsArray.length = 0;
                    i = 0;
                    frame = 0;
                }
                return;
            }
            if (!projectileExist) {
                footprintsArray.length = 0;
                i = 0;
                frame = 0;
                return;
            }
            frame++;

            if (footprintsArray.length === 0) {
                footprintsArray.push([projectile.x, projectile.y]);
                return;
            }
            else if (footprintsArray.length < 10) {
                if (frame % 5 == 0) {
                    footprintsArray.push([projectile.x, projectile.y]);
                    i++;
                }
            }
            else {
                if (frame % 5 == 0) {
                    footprintsArray.shift();
                    footprintsArray.push([projectile.x, projectile.y]);
                }
            }

            for (var j = 0; j < footprintsArray.length; j++) {
                ctx.beginPath();
                ctx.arc(footprintsArray[j][0], footprintsArray[j][1], projectile.r, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.strokeStyle = color.footprints;
                ctx.lineWidth = defaultWidth / 4;
                ctx.stroke();

            }
        }
    })();


    var drawAimingHelper = (function () {
        var aimingArray = [];
        return function () {
            if (projectileExist) {
                aimingArray.length = 0;
                return;
            }
            if (power !== 0) {
                if (!aimingChecked) {
                    aimingArray.length = 0;
                    return;
                }
                aimingArray = fillAimingArray();
            }

            for (var j = 0; j < aimingArray.length; j++) {
                ctx.beginPath();
                ctx.arc(aimingArray[j][0], aimingArray[j][1], unit / 10, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.strokeStyle = color.aiming;
                ctx.lineWidth = defaultWidth/10;
                ctx.stroke();
            }
        }
    })();

    var draw = function () {
        drawControl();
        drawCanonTube(degree);
        drawCanonBase();
        drawPowerLine();
        drawFootPrints();
        drawAimingHelper();
        drawProjectile();
        drawProjectileDestination();


    };
//</editor-fold

// <editor-fold desc="Update">
    var updateDegree = function () {
        if (rotateDir === 0) {
            return;
        }
        if ((degree <= minDegree && rotateDir == -1) || (degree >= maxDegree && rotateDir == 1)) return;
        degree += deltaDegree;

    };

    var updatePowerLevel = function () {
        if (!powerCanChange) return;

        if (power == minPower) deltaPower = Math.abs(deltaPower);
        else if (power == maxPower) deltaPower = Math.abs(deltaPower) * -1;

        power += deltaPower;
    };

    var updateProjectile = function () {
        if (!projectileExist) return;

        var oldX = projectile.x, oldY = projectile.y;

        projectile.x += projectile.speed.x;
        projectile.y += projectile.speed.y;

        projectile.speed.y = projectile.speed.y + gravity;

        var x = projectileWallIntersection(projectile);
        if (x.bounce) {
            projectile.speed.y *= x.dy;
            projectile.speed.x *= x.dx;
        }
        if (Math.abs(projectile.speed.x) < 0.045) projectile.speed.x = 0;
        if (oldX === projectile.x && oldY === projectile.y) {
            projectileExist = false;
        }

    };

    var update = function () {
        updateDegree();
        updatePowerLevel();
        updateProjectile();
    };
//</editor-fold

    var predictProjectileDestination = function () {
        testProjectile = {
            x: projectile.x,
            y: projectile.y,
            r: projectile.r,
            speed: {
                x: projectile.speed.x,
                y: projectile.speed.y
            }
        };

        testProjectileExist = true;

        while (testProjectileExist) {
            var oldX = testProjectile.x, oldY = testProjectile.y;

            testProjectile.x += testProjectile.speed.x;
            testProjectile.y += testProjectile.speed.y;

            testProjectile.speed.y = testProjectile.speed.y + gravity;

            var x = projectileWallIntersection(testProjectile);
            if (x.bounce) {
                testProjectile.speed.y *= x.dy;
                testProjectile.speed.x *= x.dx;
            }
            if (Math.abs(testProjectile.speed.x) < 0.05) testProjectile.speed.x = 0;
            if (oldX === testProjectile.x && oldY === testProjectile.y) {
                testProjectileExist = false;
            }
        }
    };

    var shootProjectile = function () {
        var ratio = maxProjectileSpeed * currentPower / maxPower;
        projectile = {
            x: canon.tube.x + canon.tube.w / 2 + canon.tube.h * Math.sin(Math.PI * (degree / 180)),
            y: canon.tube.y + canon.tube.h - canon.tube.h * Math.cos(Math.PI * (degree / 180)),
            r: unit / 2 + defaultWidth / 2,
            speed: {
                x: ratio * (degree == 90 ? 0 : Math.sin(Math.PI * (degree / 180))),
                y: (ratio * Math.cos(Math.PI * (degree / 180))) * -1
            }
        };
        predictProjectileDestination();
        projectileExist = true;
    };

// <editor-fold desc="Running">

    var loop = function () {
        mainLoopToken = requestAnimationFrame(loop);

        ctx.clearRect(0, 0, displayWidth, displayHeight);

        update();
        draw();
    };

    var stop = function () {
        isPaused = true;
        drawControl();
        cancelAnimationFrame(mainLoopToken);
    };

    var start = function () {
        isPaused = false;
        setTimeout(loop, 1000 / 60);
    };
//</editor-fold

// <editor-fold desc="Initialization">
    var initSettings = function () {
        isPaused = true;

        degree = 45;
        deltaDegree = 1;
        minDegree = 0;
        maxDegree = 89;
        rotateDir = 0;

        power = 0;
        deltaPower = 1;
        minPower = 0;
        maxPower = 100;
        powerCanChange = false;

        projectileExist = false;
        testProjectileExist = false;
    };

    var initObjects = function () {
        canon = {
            base: {
                x: unit * 3,
                y: displayHeight,
                r: unit * 2
            },
            tube: {
                x: unit * 2.25,
                y: displayHeight - unit * 4.5,
                w: unit * 1.5,
                h: unit * 3.75
            }
        };
        powerBar = {
            x: unit / 2,
            y: displayHeight - 8 * unit,
            w: unit,
            h: unit * 6
        };
        dLevel = (powerBar.h - defaultWidth) / maxPower;
    };

    var initGame = function () {
        initSettings();
        initObjects();
        draw();
    };
    initGame();


// </editor-fold

// <editor-fold desc="Event handling">
    document.getElementById('aiming').onclick = function () {
        aimingChecked = this.checked;
    };

    document.getElementById('predictions').onclick = function () {
        predictionChecked = this.checked;
    };
    document.getElementById('footprints').onclick = function () {
        footprintChecked = this.checked;
    };

    window.onkeydown = function (e) {
        switch (e.keyCode) {
            case key.P:
                if (isPaused) {
                    start();
                    return;
                }
                if (!isPaused) {
                    stop();
                }
                break;
            case key.SPACE:
                    if (!projectileExist) {
                        powerCanChange = true;
                    }
                break;
            case key.D:
                if (rotateDir !== 1) {
                    deltaDegree = deltaDegree > 0 ? deltaDegree : -deltaDegree;
                    rotateDir = 1;

                }
                break;
            case key.A:
                if (rotateDir !== -1) {
                    deltaDegree = deltaDegree < 0 ? deltaDegree : -deltaDegree;
                    rotateDir = -1;

                }
                break;
        }
    };

    window.onkeyup = function (e) {
        switch (e.keyCode) {
            case key.SPACE:
                    if (!projectileExist) {
                        powerCanChange = false;
                        currentPower = power;
                        power = 0;
                        shootProjectile();
                    }
                break;
            case key.D:
                if (rotateDir == 1)
                    rotateDir = 0;
                break;
            case key.A:
                if (rotateDir == -1)
                    rotateDir = 0;
                break;
        }
    };
//</editor-fold

})();

