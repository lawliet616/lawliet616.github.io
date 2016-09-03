/**
 * Created by Valentin on 2015.07.02..
 */

(function () { // module pattern

    //-------------------------------------------------------------------------
    // POLYFILLS
    //-------------------------------------------------------------------------

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

    //-------------------------------------------------------------------------
    // UTILITIES
    //-------------------------------------------------------------------------

    function timeStamp() {
        return new Date().getTime();
    }

    function randomInteger(min, max) {
        return (min + Math.floor(Math.random() * (max - min + 1)))
    }

    //-------------------------------------------------------------------------
    // GAME CONSTANTS AND VARIABLES
    //-------------------------------------------------------------------------

    var MAP = {tw: 40, th: 22},                 // the size of the map (in tiles)
        TILE = 32,                              // the size of each tile (in game pixels)
        GRAVITY = TILE / 5000,
        INITIALDX = TILE * 12 / 1000,           // initial horizontal gift (12 tile per second)
        MAXDX = TILE * 20 / 1000,               // max horizontal gift (20 tiles per second)
        ACCEL = (MAXDX - INITIALDX) / 60 / 1000,// horizontal acceleration -  takes 60 seconds to reach MAXDX
        JUMP = TILE * 30 / 1000;                // jump impulse

    var COLOR = {
            BACKGROUND: 0xFFFFEE,
            //
            BLUE: 0x69D2E7,
            GREENISH_BLUE: 0xA7DBD8,
            SAND: 0xE0E4CC,
            ORANGE: 0xF38630,
            DARK_ORANGE: 0xFA6900,
            //
            BROWN: 0x9A6648,
            STRAWBERRY: 0xE08E79,
            CREME: 0xF1D4AF,
            SAND2: 0xECE5CE,
            LIGHT_GREENISH_BLUE: 0xC5E0DC

        },
        KEY = {
            SPACE: 32,
            UP: 38,
            DOWN: 40,
            ZERO: 48,
            ONE: 49,
            TWO: 50,
            P: 80,
            S: 83,
            W: 87
        };

    // SETUP PIXI
    var width = MAP.tw * TILE,
        height = MAP.th * TILE,
        stage = new PIXI.Container(),
        game = new PIXI.Container(),
        renderer = PIXI.autoDetectRenderer(width, height, {
            view: document.getElementById('canvas'),
            backgroundColor: COLOR.BACKGROUND,
            antialias: true
        }),
        graphics = new PIXI.Graphics(),
        time = new PIXI.Text('TIME\n0:00', {
            font: '20px Arial',
            fill: COLOR.CREME,
            align: 'center'
        }),
        bestTime = new PIXI.Text('BEST 0:00', {
            font: '20px Arial',
            fill: COLOR.CREME,
            align: 'center'
        }),
        controls = new PIXI.Text('P: pause/resume   SPACE: jump, hold for bigger jump', {
            font: 'bold 22px Arial',
            fill: COLOR.BACKGROUND
        }),
        startText = new PIXI.Text('PRESS S', {
            font: 'bold 64px Arial',
            fill: COLOR.STRAWBERRY
        });


    document.body.appendChild(renderer.view);

    game.pivot.set(width / 2, height / 2);
    game.position.set(width / 2, height / 2);

    controls.position.x = width / 2;
    controls.position.y = height / 2;
    controls.anchor.x = 0.5;
    controls.anchor.y = 0.5;

    startText.position.x = width / 2;
    startText.position.y = height / 4;
    startText.anchor.x = 0.5;
    startText.anchor.y = 0.5;

    time.position.x = width / 2;
    time.position.y = 0;
    time.anchor.x = 0.5;

    bestTime.position.x = width / 2;
    bestTime.position.y = height - 22;
    bestTime.anchor.x = 0.5;

    game.addChild(graphics);
    stage.addChild(game);
    stage.addChild(time);
    stage.addChild(bestTime);

    stage.addChild(controls);

    stage.addChild(startText);

    // Variables
    var baseLine;

    var player,
        count;

    var obstacleArray,
        obstacle_speed,
        minDist,
        maxDist;

    var timer,
        seconds,
        minutes,
        bestMinutes = 0,
        bestSeconds = 0;

    var spaceHold,
        gameEnd,
        newGame,
        frameToken;


    var degree = 27,
        bound = degree * Math.PI / 180,
        dALPHA = bound / 30000,                     // takes 30s to reach 27 degree from 0
        dALPHA_max = bound / 3000,                  // takes 3s to reach 27 degree from 0
        ddALPHA = (dALPHA_max - dALPHA) / 60000;    // takes 60s to reach dALPHA_max

    // -------------------------------------------------------------------------
    // UPDATE
    //-------------------------------------------------------------------------

    function rectIntersection(rect1, rect2) {
        return !(rect1.x + rect1.w < rect2.x || rect2.x + rect2.w < rect1.x || rect1.y + rect1.h < rect2.y || rect2.y + rect2.h < rect1.y);
    }

    function flipGame() {
        game.scale.y = game.scale.y > 0 ? -1 : 1;
    }

    function rotateGame(dt) {
        game.rotation += dALPHA * dt;
        if (-bound > game.rotation || bound < game.rotation) {
            dALPHA = -dALPHA;
            game.rotation = game.rotation > 0 ? bound : -bound;
            flipGame();
        }

        if (Math.abs(dALPHA) == dALPHA_max) return;

        dALPHA = dALPHA > 0 ? dALPHA + ddALPHA * dt : dALPHA - ddALPHA * dt;
        if (Math.abs(dALPHA) >= dALPHA_max) dALPHA = dALPHA > 0 ? dALPHA_max : -dALPHA_max;
    }

    function updateObstacles(dt) {
        if (obstacleArray[0].x < -obstacleArray[0].w - 3 * TILE) {
            obstacleArray.shift();

            var index = obstacleArray.length - 1,
                rect = {
                    x: obstacleArray[index].x + obstacleArray[index].w + (randomInteger(minDist, maxDist)) * TILE,
                    y: height / 2 - TILE / 2 - TILE,
                    w: randomInteger(1, 2) * TILE,
                    h: TILE,
                    color: COLOR.BROWN
                };
            obstacleArray.push(rect);
    }

        var i;
        for (i = 0; i < obstacleArray.length; i++) {
            obstacleArray[i].x -= obstacle_speed * dt;

            if (rectIntersection(player, obstacleArray[i])) {

                if (player.dy > 0) player.y = obstacleArray[i].y - player.h ;
                else obstacleArray[i].x = player.x + player.w;

                gameEnd = true;
                return;
            }
        }

        if (obstacle_speed >= MAXDX) {
            obstacle_speed = MAXDX;
            return;
        }

        obstacle_speed += ACCEL * dt;
    }

    function updatePlayer(dt) {
        if (player.jumping) {
            if (count == 0) {
                player.dy -= JUMP;
                count++;
            }
            else if (spaceHold && count < 15 && !player.falling) {
                if (count > 3) player.dy -= JUMP / 12;
                count++;
            }

            player.y += player.dy * dt;
            player.dy += GRAVITY * dt;

            if (player.dy > 0) player.falling = true;

            if (player.y + player.h >= baseLine.y) {
                player.y = baseLine.y - player.h;
                player.dy = 0;
                player.jumping = false;
                player.falling = false;
                count = 0;
            }
        }
    }

    function updateTime(dt) {
        timer += dt;
        seconds = Math.ceil(timer / 1000);

        if (seconds !== 0 && seconds % 60 === 0) {
            minutes++;
            seconds = 0;
            timer = 0;
        }
        time.text = 'TIME\n' + minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
    }

    function update(dt) {
        rotateGame(dt);
        updatePlayer(dt);
        updateObstacles(dt);
        updateTime(dt);
    }

    //-------------------------------------------------------------------------
    // DRAW
    //-------------------------------------------------------------------------

    function fillObstacleArray() {
        obstacleArray.length = 0;

        var quantity = Math.ceil(46 / 4), // max distance diagonally in TILES / min distance between obstacles
            i,
            dx = 0;

        for (i = 0; i < quantity; i++) {
            var rect = {
                x: width + dx * TILE,
                y: height / 2 - TILE / 2 - TILE,
                w: randomInteger(1, 2) * TILE,
                h: TILE,
                color: COLOR.BROWN
            };

            dx = dx + rect.w / TILE + randomInteger(minDist, maxDist);

            obstacleArray.push(rect);
        }
    }

    function drawObstacles() {
        var i,
            max;
        for (i = 0, max = obstacleArray.length; i < max; i++) {
            drawRect(obstacleArray[i]);
        }
    }

    function drawRect(rect) {
        graphics.beginFill(rect.color, 1);
        graphics.drawRect(rect.x, rect.y, rect.w, rect.h);
        graphics.endFill();
    }

    function draw() {
        graphics.clear();
        drawRect(baseLine);
        drawRect(player);
        drawObstacles();
    }

    //-------------------------------------------------------------------------
    // THE GAME LOOP
    //-------------------------------------------------------------------------

    function start() {
        if (!frameToken) {
            lastFrameTime = timeStamp();
            frame();
            return true;
        }
        return false;
    }

    function stop() {
        if (frameToken) {
            cancelAnimationFrame(frameToken);
            frameToken = undefined;
            return true;
        }
        return false;
    }

    var lastFrameTime;

    function frame() {
        var currentFrameTime = timeStamp(),
            dt = currentFrameTime - (lastFrameTime || currentFrameTime);
        lastFrameTime = currentFrameTime;

        console.log(dt);
        update(dt);
        draw();
        renderer.render(stage);

        if(gameEnd) {
            stage.addChild(startText);
            bestMinutes = minutes > bestMinutes ? minutes : bestMinutes;
            bestSeconds = seconds > bestSeconds ? seconds : bestSeconds;

            bestTime.text = 'BEST ' + bestMinutes + ':' + (bestSeconds < 10 ? '0' + bestSeconds : bestSeconds);

            draw();
            renderer.render(stage);
            stop();

            init();
            return;
        }

        frameToken = requestAnimationFrame(frame);
    }

    function initObjects() {
        baseLine = {
            x: -width / 2,
            y: height / 2 - TILE / 2,
            w: width * 2,
            h: TILE,
            color: COLOR.CREME
        };
        player = {
            x: width / 3,
            y: height / 2 - TILE / 2 - TILE,
            w: TILE,
            h: TILE,
            color: COLOR.STRAWBERRY,
            dy: 0,
            jumping: false,
            falling: false
        };
        obstacleArray = [];

        count = 0;
        obstacle_speed = INITIALDX;
        minDist = 8;
        maxDist = 15;
        timer = 0;
        seconds = 0;
        minutes = 0;


        dALPHA = bound / 30000;
    }

    function initSettings() {
        newGame = true;
        spaceHold = false;
        gameEnd = false;

        game.scale.y = 1;
        game.rotation = 0;
        time.text = 'TIME\n0:00';
    }

    function init() {
        initSettings();
        initObjects();
        fillObstacleArray();
    }

    init();
    draw();
    renderer.render(stage);

    window.onkeydown = function (e) {
        switch (e.keyCode) {
            case KEY.SPACE:
                if (!player.jumping) {
                    player.jumping = true;
                }
                spaceHold = true;
                break;
            case KEY.P:
                if(!newGame) {
                    if (!start()) {
                        stop();
                    }
                }
                break;
            case KEY.S:
                if (newGame) {
                    stage.removeChild(controls);
                    stage.removeChild(startText);
                    newGame = false;
                    start();
                }
                break;
        }
    };

    window.onkeyup = function (e) {
        switch (e.keyCode) {
            case KEY.SPACE:
                spaceHold = false;
                break;
        }
    };

})();

