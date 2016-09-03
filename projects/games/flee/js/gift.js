/**
 * Created by Valentin on 2016.02.23..
 */
var m = m || {};

m.gift = function () {
    Function.prototype.subclass = function (base) {
        var c = Function.prototype.subclass.nonconstructor;
        c.prototype = base.prototype;
        this.prototype = new c();
    };
    Function.prototype.subclass.nonconstructor = function () {
    };

    /* Base */
    function Gift(type, minInterval, maxInterval, color, firstDelay) {
        this.type = type;
        this.minInterval = minInterval;
        this.maxInterval = maxInterval;
        this.color = color;
        this.firstDelay = firstDelay;

        this.rate = 1;
        this.isAlive = false;
        this.interval = 0;
        this.body = {};
        this.token = null;
    }

    Gift.prototype.add = function () {
        this.body = {
            w: m.global.unit,
            h: m.global.unit,
            x: m.utils.random(0, m.global.displayWidth - m.global.unit),
            y: m.utils.random(0, m.global.displayHeight - m.global.unit)
        };

        this.isAlive = true;
        if (m.global.debug) console.log(this.type + " gift spawned");
    };
    Gift.prototype.init = function () {
        this.isAlive = false;
        this.interval = m.utils.random(this.minInterval, this.maxInterval) / this.rate;
        var time = m.utils.round(this.interval + this.firstDelay / this.rate);

        this.token = setTimeout(this.add.bind(this), time);

        if (m.global.debug) console.log(this.type + " gift will spawn in " + time + " ms");
    };
    Gift.prototype.draw = function (ctx) {
        if (this.isAlive) {
            m.utils.drawRect(ctx, this.body, this.color);
        }
    };
    Gift.prototype.clear = function () {
        clearTimeout(this.token);
    };
    Gift.prototype.onCollect = function () {
        this.interval = m.utils.random(this.minInterval, this.maxInterval) / this.rate;
        var time = m.utils.round(this.interval);
        this.token = setTimeout(this.add.bind(this), time);

        if (m.global.debug) {
            console.log(this.type + " gift collected");
            console.log(this.type + " gift will spawn in " + time + " ms");
        }
    };
    Gift.prototype.setRate = function (rate) {
        this.rate = rate;
    };
    Gift.prototype.getRate = function () {
        return this.rate;
    };


    /* Speed */
    function SpeedGift(type, minInterval, maxInterval, color, firstDelay, effectDuration) {
        Gift.call(this, type, minInterval, maxInterval, color, firstDelay);
        this.effectDuration = effectDuration;
        this.effectToken = null;
    }

    SpeedGift.subclass(Gift);

    SpeedGift.prototype.update = function (player) {
        if (this.isAlive && m.utils.rectIntersection(this.body, player)) {
            this.isAlive = false;
            this.body = {};

            m.player.setMultiplier(m.player.getMultiplier() * 2);
            m.player.setColor(this.color);

            if (this.effectToken != null) {
                window.clearTimeout(this.effectToken);
            }

            this.effectToken = window.setTimeout(function () {
                m.player.setMultiplier(m.player.getMultiplier() / 2);
                m.player.setColor("default");
            }, this.effectDuration);

            this.onCollect();
        }
    };

    /* Slow */
    function SlowGift(type, minInterval, maxInterval, color, firstDelay, effectDuration) {
        Gift.call(this, type, minInterval, maxInterval, color, firstDelay);
        this.effectDuration = effectDuration;
        this.effectToken = null;
    }

    SlowGift.subclass(Gift);

    SlowGift.prototype.update = function (player) {
        if (this.isAlive && m.utils.rectIntersection(this.body, player)) {
            this.isAlive = false;
            this.body = {};

            m.enemy.setMultiplier(m.enemy.getMultiplier() / 4);

            if (this.effectToken != null) {
                window.clearTimeout(this.effectToken);
            }

            this.effectToken = window.setTimeout(function () {
                m.enemy.setMultiplier(m.enemy.getMultiplier() * 4);
            }, this.effectDuration);

            this.onCollect();
        }
    };

    var speedGift = new SpeedGift("speed", 8000, 16000, "#9DE0AD", 4000, 5000);
    var slowGift = new SlowGift("slow", 10000, 20000, "#91204D", 16000, 5000);

    return {
        init: function () {
            speedGift.init();
            slowGift.init();
        },
        update: function (player) {
            speedGift.update(player);
            slowGift.update(player);
        },
        draw: function (ctx) {
            speedGift.draw(ctx);
            slowGift.draw(ctx);
        },
        clear: function () {
            speedGift.clear();
            slowGift.clear();
        },
        setRate: function (x) {
            speedGift.setRate(x);
            slowGift.setRate(x);
        },
        getRate: function () {
            return speedGift.getRate();
        }
    }
}();