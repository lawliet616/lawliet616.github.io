/**
 * Created by Valesz on 2015.06.23..
 */
"use strict";
// <editor-fold desc="Global">
var key = {
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
var color = {
    text: "grey",
    statText: "#FF9900",
    headerText: "grey",
    rect: "#FF9900",
    ball: "#FF9900",
    middleLine: "#FFD699",
    score: "#FFD699"
};
var font = {
    miniText: "bold 14px Arial",
    text: "bold 16px Arial",
    modeText: "bold 24px Arial",
    statText: "10px Arial",
    headerText: "bold 40px Arial",
    caption: "bold 52px Arial"
};

var canvas, ctx;
var footprintChecked = false, predictionChecked = false, statsChecked = true;
var isPaused, gameEnded, mainLoopToken, gameMode, newGame;
var stats, rectL, rectR, ball, testBall;


var displayWidth = 1280;
var displayHeight = 720;
var fps = 60;

var rectSpeed = displayHeight / ( 2 * 1000);                          // takes 2s to move from bottom to the top
var ballHorizontalInitialSpeed = displayWidth / (4 * 1000);           // takes 4s to move from left to the right
var ballMaxHorizontalSpeed = ballHorizontalInitialSpeed * 4;          // takes 1s to move from left to the right
var timeToReachMaxSpeed = 120 * 1000;                                 // takes 120s to reach max gift
var horizontalAcceleration = (ballMaxHorizontalSpeed - ballHorizontalInitialSpeed) / timeToReachMaxSpeed;
var verticalAcceleration;

var verticalSpeedDiffOnImpact = 0.2 * ballHorizontalInitialSpeed;

var randomGap;
// </editor-fold>

canvas = document.getElementById('canvas');
canvas.width = displayWidth;
canvas.height = displayHeight;
ctx = canvas.getContext("2d");

// <editor-fold desc="Utility">
var random = function (min, max) {
    return (min + (Math.random() * (max - min)));
};
var randomChoice = function () {
    return arguments[Math.floor(random(0, arguments.length))];
};
var timeStamp = function () {
    return new Date().getTime();
};
// </editor-fold>

// <editor-fold desc="Drawing">
var drawRect = function (rect, style) {
    if (style == undefined) style = color.rect;
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.closePath();
    ctx.fillStyle = style;
    ctx.fill();
};


var drawMiddleLine = function () {
    var slices = 21;
    var dy = displayHeight / slices;
    for (var i = 0; i < slices; i++) {
        if (i % 2 == 0) {
            ctx.beginPath();
            ctx.moveTo(displayWidth / 2, i * dy);
            ctx.lineTo(displayWidth / 2, (i + 1) * dy);
            ctx.closePath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = color.middleLine;
            ctx.stroke();
        }
    }
};

var drawDigits = function (score, x, y) {
    if (score > 9) return;
    var digits = [
        [1, 1, 1, 0, 1, 1, 1], // 0
        [0, 0, 1, 0, 0, 1, 0], // 1
        [1, 0, 1, 1, 1, 0, 1], // 2
        [1, 0, 1, 1, 0, 1, 1], // 3
        [0, 1, 1, 1, 0, 1, 0], // 4
        [1, 1, 0, 1, 0, 1, 1], // 5
        [1, 1, 0, 1, 1, 1, 1], // 6
        [1, 0, 1, 0, 0, 1, 0], // 7
        [1, 1, 1, 1, 1, 1, 1], // 8
        [1, 1, 1, 1, 0, 1, 0]  // 9
    ];

    var unit = 15;
    var blocks = [
        [x, y, 3 * unit, unit],
        [x, y, unit, 3 * unit],
        [x + 2 * unit, y, unit, 3 * unit],
        [x, y + 2 * unit, 3 * unit, unit],
        [x, y + 2 * unit, unit, 3 * unit],
        [x + 2 * unit, y + 2 * unit, unit, 3 * unit],
        [x, y + 4 * unit, 3 * unit, unit]
    ];

    for (var i = 0; i < digits[score].length; i++) {
        if (digits[score][i]) {
            ctx.beginPath();
            ctx.rect(blocks[i][0], blocks[i][1], blocks[i][2], blocks[i][3]);
            ctx.closePath();
            ctx.fillStyle = color.score;
            ctx.fill();
        }
    }
};
var drawScore = function () {
    drawDigits(rectL.score, displayWidth / 2 - 75, 20);
    drawDigits(rectR.score, displayWidth / 2 + 30, 20);
};

var drawRects = function () {
    drawRect(rectR);
    drawRect(rectL);
};

var drawBall = function (style) {
    if (style == undefined) style = color.ball;
    drawRect(ball, style);
};
var drawStats = function () {
    if (statsChecked) {
        ctx.font = font.statText;
        ctx.fillStyle = color.statText;
        ctx.fillText("speedX: " + stats.speedx + " px/ms", displayWidth - 103, displayHeight - 35);
        ctx.fillText("speedY: " + stats.speedy + " px/ms", displayWidth - 103, displayHeight - 25);
        ctx.fillText("update: " + stats.update + "ms", displayWidth - 100, displayHeight - 15);
        ctx.fillText("draw: " + stats.draw + "ms", displayWidth - 89, displayHeight - 5);
    }
};

var drawControl = function () {
    //header
    ctx.fillStyle = color.text;
    ctx.font = font.modeText;
    ctx.fillText("press '1' for player vs player", 60, 250);
    ctx.fillText("press '2' for player vs computer", displayWidth - 430, 250);
    //left
    ctx.fillStyle = color.text;
    ctx.font = font.text;
    ctx.fillText("'w'", 60, displayHeight / 2 - 16);
    ctx.fillText(": move up", 100, displayHeight / 2 - 16);
    ctx.fillText("'s'", 60, displayHeight / 2 + 16);
    ctx.fillText(": move down", 100, displayHeight / 2 + 16);
    //right
    ctx.fillText("'up'", 1050, displayHeight / 2 - 16);
    ctx.fillText(": move up", 1110, displayHeight / 2 - 16);
    ctx.fillText("'down'", 1050, displayHeight / 2 + 16);
    ctx.fillText(": move down", 1110, displayHeight / 2 + 16);
    // secret
    ctx.font = font.miniText;
    ctx.fillText("check the tickboxes to get fancy functions", 60, displayHeight - 25);
    ctx.fillText("note: predictions only work against computer", 60, displayHeight - 10);
};

var drawPredictedDestination = function () {
    if (gameMode == 2 && predictionChecked) {
        if (testBall !== null && ball.gift.x > 0) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = "2";
            ctx.strokeRect(testBall.x, testBall.y, ball.w, ball.h);
        }
    }
};

var array = [];
var tag = 0;
var drawFootPrints = (function () {

    return function () {
        if (!footprintChecked) {
            if (array.length > 0) {
                array.length = 0;
                tag = 0;
            }
            return;
        }
        if (array.length === 0) {
            array.push([ball.x, ball.y]);
            return;
        }
        else if (array.length < 10) {
            if (Math.abs(array[tag][0] - ball.x) > displayWidth / 16) {
                array.push([ball.x, ball.y]);
                tag++;
            }
        }
        else {
            if (Math.abs(array[tag][0] - ball.x) > displayWidth / 16) {
                array.shift();
                array.push([ball.x, ball.y]);
            }
        }

        ctx.strokeStyle = "grey";
        ctx.lineWidth = "2";
        for (var j = 0; j < array.length; j++) {

            ctx.strokeRect(array[j][0], array[j][1], ball.w, ball.h);
        }
    }
})();
// </editor-fold>

// <editor-fold desc="Game logic">
var resetBallSpeed = function (side) {
    if (side == undefined) side = "L";

    var dx;
    if (side == "L") dx = 1;
    if (side == "R") dx = -1;

    ball.gift = {
        x: ballHorizontalInitialSpeed * dx,
        y: random(-ballHorizontalInitialSpeed, ballHorizontalInitialSpeed)
    };
};

var resetBallPos = function (side) {
    var ballX, ballY;
    if (side == undefined) {
        ballX = displayWidth / 2 - 10;
        ballY = displayHeight / 2 - 10;
    }
    if (side == "L") {
        ballX = rectL.x + rectL.w;
        ballY = rectL.y + rectL.h / 2;
    }
    if (side == "R") {
        ballX = rectR.x - ball.w;
        ballY = rectR.y + rectL.h / 2;
    }
    ball = {
        x: ballX,
        y: ballY,
        w: 20,
        h: 20
    };
    testBall = null;
};

var restartRound = function (side) {
    resetBallPos(side);
    resetBallSpeed(side);
    array.length = 0;
    tag = 0;
};

var rectIntersection = function (rect1, rect2) {
    return !(rect1.x + rect1.w < rect2.x || rect2.x + rect2.w < rect1.x || rect1.y + rect1.h < rect2.y || rect2.y + rect2.h < rect1.y);
};

var ballColliding = function (ball) {
    if (0 >= ball.x) return 'leftWall';
    if (ball.x + ball.w >= displayWidth) return 'rightWall';
    if (0 >= ball.y) return 'topWall';
    if (ball.y + ball.h >= displayHeight) return 'bottomWall';

    // Ha metszik egymást
    if (rectIntersection(rectL, ball)) {
        // Ha frontálisan érintik egymást
        if (ball.x <= rectL.x + rectL.w) {
            if (ball.y + ball.h >= rectL.y && ball.y < rectL.y + rectL.h / 3) return 'rectLtop';
            if (ball.y + ball.h >= rectL.y + rectL.h / 3 && ball.y <= rectL.y + (2 * rectL.h) / 3) return 'rectLmid';
            else return 'rectLbot';
        }
    }


    // Ha metszik egymást
    if (rectIntersection(rectR, ball)) {
        // Ha frontálisan érintik egymást
        if (ball.x + ball.w >= rectR.x) {
            if (ball.y + ball.h >= rectR.y && ball.y < rectR.y + rectR.h / 3) return 'rectRtop';
            if (ball.y + ball.h >= rectR.y + rectR.h / 3 && ball.y <= rectR.y + (2 * rectR.h) / 3) return 'rectRmid';
            else return 'rectRbot';
        }
    }
    return 'nothing';
};

var accelerateBall = function (dt, ball) {
    // vertical acceleration must to compute, because of verticalSpeedDiffOnImpact
    verticalAcceleration = horizontalAcceleration * Math.abs(ball.gift.y / ball.gift.x); // ball.gift.x never equals to 0

    if (Math.abs(ball.gift.x) < ballMaxHorizontalSpeed) {
        ball.gift.x = ball.gift.x > 0 ? ball.gift.x + horizontalAcceleration * dt : ball.gift.x - horizontalAcceleration * dt;
        ball.gift.y = ball.gift.y > 0 ? ball.gift.y + verticalAcceleration * dt : ball.gift.y - verticalAcceleration * dt;
    }
};

var gameWon = function (winner) {
    if (winner == undefined) return;
    if (winner == "L") {
        gameEnded = true;
        ctx.fillStyle = color.headerText;
        ctx.font = font.caption;
        ctx.fillText("WINNER!", displayWidth/4 - 100, 100);
        return;
    }
    if (winner == "R") {
        gameEnded = true;
        ctx.fillStyle = color.headerText;
        ctx.font = font.caption;
        ctx.fillText("WINNER!", 3 * displayWidth / 4 - 100, 100);
    }
};

var updateScore = function (winner) {
    if (winner == undefined) return;
    if (winner == "L") {
        if (rectL.score === 9) {
            gameWon("L");
            return;
        }
        rectL.score += 1;
        return;
    }
    if (winner == "R") {
        if (rectR.score === 9) {
            gameWon("R");
            return;
        }
        rectR.score += 1;
    }
};

// Player vs Player
var updateRectL = function (dt) {
    if (rectL.dir !== "stay") {
        if (rectL.y <= 0 && rectL.dir === 'up') {
            rectL.y = 0;
            return;
        }

        if (rectL.y + rectL.h >= displayHeight && rectL.dir === 'down') {
            rectL.y = displayHeight - rectL.h;
            return;
        }

        rectL.y += rectL.gift * dt;
    }
};
var updateRectR = function (dt) {
    if (rectR.dir !== "stay") {
        if (rectR.y <= 0 && rectR.dir === 'up') {
            rectR.y = 0;
            return;
        }

        if (rectR.y + rectR.h >= displayHeight && rectR.dir === 'down') {
            rectR.y = displayHeight - rectR.h;
            return;
        }

        rectR.y += rectR.gift * dt;
    }
};

var updateBall = function (dt) {
    ball.x += ball.gift.x * dt;
    ball.y += ball.gift.y * dt;
    accelerateBall(dt, ball);

    switch (ballColliding(ball)) {
        default:
        case 'nothing':
            break;
        case 'leftWall':
            ball.x = 0;
            updateScore("R");
            if (!gameEnded) restartRound("R");
            break;
        case 'rightWall':
            ball.x = displayWidth - ball.w;
            updateScore("L");
            if (!gameEnded) restartRound("L");
            break;
        case 'bottomWall':
            ball.y = displayHeight - ball.h;
            ball.gift.y = -ball.gift.y;
            break;
        case 'topWall':
            ball.y = 0;
            ball.gift.y = -ball.gift.y;
            break;
        case 'rectLtop':
            ball.x = rectL.x + rectL.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y -= verticalSpeedDiffOnImpact;
            break;
        case 'rectLmid':
            ball.x = rectL.x + rectL.w;
            ball.gift.x = -ball.gift.x;
            break;
        case 'rectLbot':
            ball.x = rectL.x + rectL.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y += verticalSpeedDiffOnImpact;
            break;
        case 'rectRtop':
            ball.x = rectR.x - ball.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y -= verticalSpeedDiffOnImpact;
            break;
        case 'rectRmid':
            ball.x = rectR.x - ball.w;
            ball.gift.x = -ball.gift.x;
            break;
        case 'rectRbot':
            ball.x = rectR.x - ball.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y += verticalSpeedDiffOnImpact;
            break;
    }


};

// Player vs AI
var predictDestination = function () {
    testBall = {
        x: ball.x,
        y: ball.y,
        gift: {
            x: ball.gift.x,
            y: ball.gift.y
        }
    };

    var condition = function () {
        if (0 >= testBall.y) return 'topWall';
        if (testBall.y + ball.h >= displayHeight) return 'bottomWall';
    };

    while (testBall.x <= rectR.x - ball.w) {
        testBall.x += testBall.gift.x;
        testBall.y += testBall.gift.y;

        accelerateBall(16, testBall);

        switch (condition()) {
            case 'bottomWall':
                testBall.y = displayHeight - ball.h;
                testBall.gift.y = -testBall.gift.y;
                break;
            case 'topWall':
                testBall.y = 0;
                testBall.gift.y = -testBall.gift.y;
                break;
        }
    }

    testBall.x = rectR.x - ball.w;
    randomGap = random(1, 50);
};

var borderFirst = displayHeight / 2 - 5;
var borderSecond = displayHeight / 2 + 5;
var updateRectAI = function (dt) {
    var rectHalf = rectR.y + rectR.h / 2;
    if (ball.gift.x < 0) {
        if (rectHalf <= borderFirst) {
            rectR.y += rectR.gift * dt;
            return;
        }
        if (rectHalf >= borderSecond) {
            rectR.y -= rectR.gift * dt;
        }
        return;
    }


    if (rectHalf < testBall.y - randomGap) {
        rectR.y += rectR.gift * dt;
    }
    if (rectHalf > testBall.y + ball.h + randomGap) {
        rectR.y -= rectR.gift * dt;
    }

    if (rectR.y <= 0) {
        rectR.y = 0;
        return;
    }

    if (rectR.y + rectR.h >= displayHeight) {
        rectR.y = displayHeight - rectR.h;
    }
};

var updateBallAI = function (dt) {
    ball.x += ball.gift.x * dt;
    ball.y += ball.gift.y * dt;
    accelerateBall(dt, ball);


    switch (ballColliding(ball)) {
        default:
        case 'nothing':
            break;
        case 'leftWall':
            ball.x = 0;
            updateScore("R");
            if (!gameEnded)restartRound("R");
            break;
        case 'rightWall':
            ball.x = displayWidth - ball.w;
            updateScore("L");
            if (!gameEnded)restartRound("L");
            break;
        case 'bottomWall':
            ball.y = displayHeight - ball.h;
            ball.gift.y = -ball.gift.y;
            break;
        case 'topWall':
            ball.y = 0;
            ball.gift.y = -ball.gift.y;
            break;
        case 'rectLtop':
            ball.x = rectL.x + rectL.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y -= verticalSpeedDiffOnImpact;
            predictDestination();
            break;
        case 'rectLmid':
            ball.x = rectL.x + rectL.w;
            ball.gift.x = -ball.gift.x;
            predictDestination();
            break;
        case 'rectLbot':
            ball.x = rectL.x + rectL.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y += verticalSpeedDiffOnImpact;
            predictDestination();
            break;
        case 'rectRtop':
            ball.x = rectR.x - ball.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y -= verticalSpeedDiffOnImpact;
            break;
        case 'rectRmid':
            ball.x = rectR.x - ball.w;
            ball.gift.x = -ball.gift.x;
            break;
        case 'rectRbot':
            ball.x = rectR.x - ball.w;
            ball.gift.x = -ball.gift.x;
            ball.gift.y += verticalSpeedDiffOnImpact;
            break;
    }
};
// </editor-fold>

// <editor-fold desc="Runner">

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

var update = function (dt, gameMode) {
    if (gameMode === 1) {
        updateRectL(dt);
        updateRectR(dt);
        updateBall(dt);
        return;
    }
    if (gameMode === 2) {
        if (ball.gift.x > 0 && testBall == null) predictDestination();
        updateRectL(dt);
        updateRectAI(dt);
        updateBallAI(dt);
    }
};

var draw = function () {
    drawMiddleLine();
    drawScore();
    drawStats();
    drawRects();
    drawBall();
    drawPredictedDestination();
    drawFootPrints();
    if (gameEnded) {
        stop();
        drawBall("red");
        drawControl();
        initGame();
    }
};

var updateStats = function (update, draw) {
    stats.speedx = ball.gift.x.toFixed(2);
    stats.speedy = ball.gift.y.toFixed(2);
    stats.update = Math.max(1, update);
    stats.draw = Math.max(1, draw);
};

var lastFrameTime;
var loop = function () {
    mainLoopToken = requestAnimationFrame(loop);

    var currentFrameTime = timeStamp(),
        dt = currentFrameTime - (lastFrameTime || currentFrameTime);
    lastFrameTime = currentFrameTime;
    console.log(dt);
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    var startTime = timeStamp();
    update(dt, gameMode);
    var midTime = timeStamp();
    draw();
    var endTime = timeStamp();
    updateStats(midTime - startTime, endTime - midTime);
};

var stop = function () {
    isPaused = true;
    cancelAnimationFrame(mainLoopToken);

};

var start = function () {
    isPaused = false;
    lastFrameTime = timeStamp();
    setTimeout(loop, 1000 / fps);

};

// </editor-fold>

// <editor-fold desc="Initialization">
var initSettings = function () {
    gameEnded = false;
    newGame = true;
};

var initObjects = function () {
    rectL = {
        score: 0,
        w: 20,
        h: 120,
        x: 0,
        y: displayHeight / 2 - 60,
        gift: rectSpeed,
        dir: "stay"
    };
    rectR = {
        score: 0,
        w: 20,
        h: 120,
        x: displayWidth - 20,
        y: displayHeight / 2 - 60,
        gift: rectSpeed,
        dir: "stay"
    };
    ball = {
        x: displayWidth / 2 - 10,
        y: displayHeight / 2 - 10,
        w: 20,
        h: 20,
        gift: {
            x: ballHorizontalInitialSpeed * randomChoice(1, -1),
            y: random(-ballHorizontalInitialSpeed, ballHorizontalInitialSpeed)
        }
    };
    stats = {
        speedx: ball.gift.x.toFixed(2),
        speedy: ball.gift.y.toFixed(2),
        update: 0,
        draw: 0
    };
    testBall = null;
};

var initGame = function () {
    initSettings();
    initObjects();
};

initGame();
draw();
drawControl();
// </editor-fold

// <editor-fold desc="Event handling">
document.getElementById('predictions').onclick = function () {
    predictionChecked = this.checked;
};
document.getElementById('stats').onclick = function () {
    statsChecked = this.checked;
};
document.getElementById('footprints').onclick = function () {
    footprintChecked = this.checked;
};
window.onkeydown = function (e) {
    switch (e.keyCode) {
        case key.ONE:
            if (newGame) {
                gameMode = 1;
                newGame = false;
                start();
            }
            break;
        case key.TWO:
            if (newGame) {
                gameMode = 2;
                newGame = false;
                start();
            }
            break;
        case key.P: // p
        case key.SPACE: // space
            if (!newGame) {
                if (isPaused) {
                    start();
                    return;
                }
                if (!isPaused) {
                    stop();
                }
            }
            break;
        //LEFT
        case key.W: // w

            if (rectL.dir != "up") {
                rectL.gift = rectL.gift < 0 ? rectL.gift : -rectL.gift;
                rectL.dir = "up";
            }
            break;
        case key.S:
            if (rectL.dir != "down") {
                rectL.gift = rectL.gift > 0 ? rectL.gift : -rectL.gift;
                rectL.dir = "down";
            }
            break;
        //RIGHT
        case key.UP: // up
            if (gameMode == 2) return;
            if (rectR.dir != "up") {
                rectR.gift = rectR.gift < 0 ? rectR.gift : -rectR.gift;
                rectR.dir = "up";
            }
            break;
        case key.DOWN: // down
            if (gameMode == 2) return;
            if (rectR.dir != "down") {
                rectR.gift = rectR.gift > 0 ? rectR.gift : -rectR.gift;
                rectR.dir = "down";
            }
            break;
    }
};

window.onkeyup = function (e) {
    switch (e.keyCode) {
        //LEFT
        case key.W: // w
            if (rectL.dir == "up")
                rectL.dir = "stay";
            break;
        case key.S: // s
            if (rectL.dir == "down")
                rectL.dir = "stay";
            break;
        //RIGHT
        case key.UP: // up
            if (gameMode == 2) return;
            if (rectR.dir == "up")
                rectR.dir = "stay";
            break;
        case key.DOWN: // down
            if (gameMode == 2) return;
            if (rectR.dir == "down")
                rectR.dir = "stay";
            break;
    }
};
// </editor-fold>
