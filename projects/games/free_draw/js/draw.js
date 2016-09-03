var game = game || {};
game.draw = function () {

    var canvas, j_canvas;
    var ctx;
    var tmp_canvas, j_tmp_canvas;
    var tmp_ctx;

    var options = {
        defaultTool: Tool.PENCIL,
        defaultSize: Size.M,
        defaultColor: Color.AOI
    };
    var tool = options.defaultTool;
    var size = options.defaultSize;
    var color = options.defaultColor;
    var actions = [];
    var action = [];
    var painting = false;

    var init = function () {
        console.log("Initializing...");

        j_canvas = $("#canvas");
        canvas = j_canvas[0];
        ctx = canvas.getContext('2d');

        j_tmp_canvas = $("#tmp_canvas");
        tmp_canvas = j_tmp_canvas[0];
        tmp_ctx = tmp_canvas.getContext('2d');

        j_tmp_canvas.on('click mousedown mouseup mouseleave mouseout touchstart touchmove touchend touchcancel', onEvent);

        tmp_ctx.lineJoin = "round";
        tmp_ctx.lineCap = "round";
        tmp_ctx.strokeStyle = action.color;
        tmp_ctx.lineWidth = action.size;
    };

    var onEvent = function (e) {
        switch (e.type) {
            case 'mousedown':
            case 'touchstart':
                startAction(e);
                break;
            case 'mouseup':
            case 'mouseout':
            case 'mouseleave':
            case 'touchend':
            case 'touchcancel':
                stopAction(e);
                break;
            case 'mousemove':
                action.points.push(getMouseCoordinates(e));
                paintAction(action);
        }
    };

    var getMouseCoordinates = function (e) {
        return {
            x: typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX,
            y: typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY
        }
    };

    var saveTemp = function () {
        ctx.drawImage(tmp_canvas, 0, 0);
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
    };

    var startAction = function (e) {
        console.log("Start " + actions.length);
        painting = true;
        j_tmp_canvas.on("mousemove", onEvent);
        action = {
            tool: tool,
            size: size,
            color: color,
            points: []
        };
        action.points.push(getMouseCoordinates(e));
    };

    var stopAction = function (e) {
        if (painting) {
            console.log("Stop " + actions.length);
            painting = false;
            j_tmp_canvas.off("mousemove", onEvent);
            actions.push(action);
            saveTemp();
            // enableUndo button
        }
    };

    var paintAction = function (a) {
        var length = a.points.length,
            points = a.points;

        tmp_ctx.lineJoin = "round";
        tmp_ctx.lineCap = "round";
        tmp_ctx.strokeStyle = a.tool == Tool.PENCIL ? a.color : Color.WHITE;
        tmp_ctx.fillStyle = a.tool == Tool.PENCIL ? a.color : Color.WHITE;
        tmp_ctx.lineWidth = a.size;

        if (length < 3) {
            var b = points[0];
            tmp_ctx.beginPath();
            tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2);
            tmp_ctx.fill();
            tmp_ctx.closePath();
            return;
        }

        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        tmp_ctx.beginPath();
        tmp_ctx.moveTo(points[0].x, points[0].y);

        for (var i = 1; i < length - 2; i++) {
            var c = (points[i].x + points[i + 1].x) / 2;
            var d = (points[i].y + points[i + 1].y) / 2;
            tmp_ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
        }

        tmp_ctx.quadraticCurveTo(
            points[i].x,
            points[i].y,
            points[i + 1].x,
            points[i + 1].y);
        tmp_ctx.stroke();
    };

    // Exposed methods

    var clear = function () {
        console.log("Clear");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        actions = [];
        action = [];
        // disableUndo button
    };

    var undoAction = function () {
        var length = actions.length;

        if (length == 1) {
            // disableUndo button
        }

        if (length > 0) {
            actions.pop();
            length -= 1;
            console.log("Undo " + length);
            ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
            for (var i = 0; i < length; i++) {
                paintAction(actions[i]);
                saveTemp();
            }
        }
    };

    return {
        change: {
            color: function (c) {
                console.log("New color: " + c);
                color = c;
            },
            size: function (s) {
                console.log("New size: " + s);
                size = s;
            },
            tool: function (t) {
                console.log("New tool: " + t);
                tool = t;
            }
        },
        clear: clear,
        init: init,
        undo: undoAction
    }
}();

