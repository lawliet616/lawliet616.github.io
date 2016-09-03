var m = m || {};

m.game= function(){
    var btnStart = $('#btnStart');
    var btnSave = $('#btnSave');
    var menu = $('#menu');
    var spawnTime = $('#spawnTime');
    var giftRate = $('#giftRate');

    btnStart.click(function(){
        m.game.startGame();
        menu.hide();
    });

    btnSave.click(function(){
        var interval = spawnTime.val();

        if(m.utils.isInt(interval)){
            if(interval >= 100){
                m.enemy.setInterval(interval);
            } else{
                spawnTime.val("minimum is 100");
            }
        }else{
            spawnTime.val("not a number");
        }

        var rate = giftRate.val();

        if(m.utils.isInt(rate)){
            if(rate < 0.1){
                giftRate.val("minimum is 0.1");
            } else if (rate > 10) {
                giftRate.val("maximum is 10");
            } else{
                m.gift.setRate(rate);
            }
        }else{
            giftRate.val("not a number");
        }
    });

    var key = {
        SPACE: 32,
        UP: 38,
        DOWN: 40,
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        P: 80,
        S: 83,
        W: 87,
        A: 65,
        D: 68
    };

    var canvas,
        ctx;

    var mainLoopToken;

    var setupCanvas = function (){
        canvas = document.getElementById('canvas');
        canvas.width = m.global.displayWidth;
        canvas.height = m.global.displayHeight;
        ctx = canvas.getContext("2d");
    };

    var setupRequestFrame = function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    };

    var loop = function () {
        mainLoopToken = requestAnimationFrame(loop);

        ctx.clearRect(0, 0, m.global.displayWidth, m.global.displayHeight);
        update();
        draw();
    };

    var draw = function(){
        m.text.draw(ctx);
        m.player.draw(ctx);
        m.chaser.draw(ctx);
        m.enemy.drawAll(ctx);
        m.gift.draw(ctx);
    };

    var update = function(){
        m.text.update();

        m.player.update();
        var player = m.player.getBody();
        m.chaser.update(player);
        m.enemy.updateAll(player);
        m.gift.update(player);

    };

    var startGame = function (){
        m.player.init();
        m.chaser.init();
        m.enemy.init();
        m.gift.init();
        m.text.init();
        setupRequestFrame();
        setupCanvas();
        requestAnimationFrame(loop);
        if(m.global.debug) console.log("GAME STARTED");
    };

    var stopGame = function () {
        btnStart.unbind('click').click(function(){
            restartGame();
            menu.hide();
        });
        menu.show();
        m.gift.clear();
        m.enemy.clear();
        m.text.setHighscore();
        cancelAnimationFrame(mainLoopToken);
        if(m.global.debug) console.log("GAME ENDED");
    };

    var restartGame = function(){
        m.player.init();
        m.chaser.init();
        m.enemy.init();
        m.gift.init();
        m.text.init();
        requestAnimationFrame(loop);
        if(m.global.debug) console.log("GAME RESTARTED");
    };

    window.onkeydown = function (e) {
        switch (e.keyCode) {
            case key.W:
                if(!m.player.getUp()){
                    m.player.setUp(true);
                    m.player.setDown(false);
                }
                break;
            case key.S:
                if(!m.player.getDown()){
                    m.player.setDown(true);
                    m.player.setUp(false);
                }
                break;
            case key.A:
                if(!m.player.getLeft()){
                    m.player.setLeft(true);
                    m.player.setRight(false);
                }
                break;
            case key.D:
                if(!m.player.getRight()){
                    m.player.setRight(true);
                    m.player.setLeft(false);
                }
                break;
        }
    };

    window.onkeyup = function (e) {
        switch (e.keyCode) {
            case key.W:
                if(m.player.getUp())
                    m.player.setUp(false);
                break;
            case key.S:
                if(m.player.getDown())
                    m.player.setDown(false);
                break;
            case key.A:
                if(m.player.getLeft())
                    m.player.setLeft(false);
                break;
            case key.D:
                if(m.player.getRight())
                    m.player.setRight(false);
                break;
        }
    };

    return{
        startGame: startGame,
        stopGame: stopGame
    }
}();