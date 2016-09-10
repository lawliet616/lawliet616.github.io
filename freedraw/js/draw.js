var game = game || {};
game.draw = (function () {
    var canvas, j_canvas, ctx;
    var tmp_canvas, j_tmp_canvas, tmp_ctx;
    var canvasWidth, canvasHeight;

    var defaults = {
        tool: Tool.PENCIL,
        size: Size.S,
        color: {
            r: 0,
            g: 0,
            b: 0
        }
    };

    var tool = defaults.tool;
    var size = defaults.size;
    var color = defaults.color;
    var actions = [];
    var action = [];
    var painting = false;
    var shouldFill = true;

    var mainLoopToken;

    //-------------------------------------------------------------------------
    // Private methods
    //-------------------------------------------------------------------------

    /**
     * Ensures the support of the requestAnimationFrame method.
     */
    var setupRequestFrame = function () {
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
    };

    /**
     * Action painting occurs here.
     */
    var paintLoop = function () {
        mainLoopToken = requestAnimationFrame(paintLoop);
        paintAction(action);
    };

    /**
     * Starts the painting.
     */
    var startPainting = function () {
        painting = true;
        requestAnimationFrame(paintLoop);
    };

    /**
     * Stops the painting.
     */
    var stopPainting = function () {
        painting = false;
        cancelAnimationFrame(mainLoopToken);
    };

    /**
     * Returns the mouse coordinates.
     * @param e
     * @returns {{x: (*|Number), y: (*|Number)}}
     */
    var getMouseCoordinates = function (e) {
        return {
            x: typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX,
            y: typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY
        }
    };

    /**
     * Initializes the action object.
     * @param e
     */
    var initAction = function (e) {
        action = {
            tool: tool,
            size: size.value,
            color: color,
            points: []
        };
        action.points.push(getMouseCoordinates(e));
    };

    /**
     * Comperes two mouse coordinates.
     * @param p1
     * @param p2
     * @returns {boolean}
     */
    var comparePoints = function (p1, p2) {
        return p1.x == p2.x && p1.y == p2.y;
    };

    /**
     * Saves the action object to the action array.
     */
    var saveAction = function () {
        if (!shouldFill && tool == Tool.PAINT_BUCKET) {
            action = [];
            return;
        }

        // paint default shape if the user just clicked
        if (action.points.length == 1 || (action.points.length == 2 && comparePoints(action.points[0], action.points[1]))) {

            switch (tool) {
                case Tool.CIRCLE:
                case Tool.TRIANGLE:
                    action.points[1] = {
                        x: action.points[0].x + defaults.size.value * 2,
                        y: action.points[0].y + defaults.size.value * 2
                    };
                    break;
                case Tool.RECTANGLE:
                case Tool.LINE:
                    action.points[1] = {
                        x: action.points[0].x + defaults.size.value * 4,
                        y: action.points[0].y + defaults.size.value * 4
                    };
            }
        }
        if (debug) console.log("Save:", action);

        paintAction(action);
        saveTemp();
        actions.push(action);

        action = [];
    };

    /**
     * Draws the image to the canvas and clears the temp canvas.
     */
    var saveTemp = function () {
        ctx.drawImage(tmp_canvas, 0, 0, canvasWidth, canvasHeight);
        tmp_ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    };

    /**
     * Handles the received events by the temp canvas.
     * @param e
     */
    var onEvent = function (e) {
        e.preventDefault();
        switch (e.type) {
            case 'mousedown':
            case 'touchstart':
                onActionStart(e);
                break;
            case 'mouseup':
            case 'mouseout':
            case 'mouseleave':
            case 'touchend':
            case 'touchcancel':
                onActionStop(e);
                break;
            case 'mousemove':
            case 'touchmove':
                onActionMove(e);
                break;
            case 'click':
                onActionClick(e);
                break;
        }
    };

    /**
     * Decides what to do with actions, which have a starting point.
     * @param e
     */
    var onActionStart = function (e) {
        if (tool == Tool.PAINT_BUCKET || tool == Tool.EYEDROPPER) return;
        if (debug) console.log("Start");

        initAction(e);
        startPainting();
    };

    /**
     * Decides what to do with actions, which have a transition state.
     * @param e
     */
    var onActionMove = function (e) {
        if (painting) {
            if (debug) console.log("Move");
            var currentCoordinates = getMouseCoordinates(e);
            if (tool == Tool.PENCIL || tool == Tool.ERASER) {
                action.points.push(currentCoordinates);
            } else if (tool == Tool.LINE) {
                action.points[1] = currentCoordinates;
            } else if (tool == Tool.RECTANGLE) {
                action.points[1] = currentCoordinates;
            } else if (tool == Tool.CIRCLE) {
                action.points[1] = currentCoordinates;
            } else if (tool == Tool.TRIANGLE) {
                action.points[1] = currentCoordinates;
            }
        }
    };

    /**
     * Decides what to do with actions, which have an endpoint.
     */
    var onActionStop = function () {
        if (tool == Tool.EYEDROPPER || tool == Tool.PAINT_BUCKET) return;

        if (painting) {
            if (debug) console.log("Stop");
            stopPainting();
            saveAction();
        }

    };

    /**
     * Decides what to do with actions, which consists of one point.
     * @param e
     */
    var onActionClick = function (e) {
        if (tool != Tool.PAINT_BUCKET && tool != Tool.EYEDROPPER) return;
        if (debug) console.log("Click");

        if (tool == Tool.PAINT_BUCKET) {
            initAction(e);
            paintRegion(action);
            saveAction();
        } else if (tool == Tool.EYEDROPPER) {
            var pos = getMouseCoordinates(e);
            var pixelPos = (pos.y * canvasWidth + pos.x) * 4;
            var data = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            changeColor(game.color.rgbColorToHex(
                    game.color.pixelToColor(pixelPos, data))
            );
        }
    };

    /**
     * Paints a curve to the temp canvas.
     * @param a
     */
    var paintCurve = function (a) {
        var length = a.points.length,
            points = a.points;

        tmp_ctx.lineJoin = "round";
        tmp_ctx.lineCap = "round";
        tmp_ctx.strokeStyle = a.tool == Tool.PENCIL ? game.color.rgbColorToHex(a.color) : "#fff";
        tmp_ctx.fillStyle = a.tool == Tool.PENCIL ? game.color.rgbColorToHex(a.color) : "#fff";
        tmp_ctx.lineWidth = a.size;

        if (length < 3) {
            var b = points[0];
            tmp_ctx.beginPath();
            tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2);
            tmp_ctx.fill();
            tmp_ctx.closePath();
            return;
        }

        tmp_ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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

    /**
     * Paints a line to the temp canvas.
     * @param a
     */
    var paintLine = function (a) {
        if (a.points.length == 1) return;

        var start = a.points[0],
            end = a.points[1];

        if (comparePoints(start, end)) return;

        tmp_ctx.lineCap = "round";
        tmp_ctx.strokeStyle = game.color.rgbColorToHex(a.color);
        tmp_ctx.lineWidth = a.size;

        tmp_ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        tmp_ctx.beginPath();
        tmp_ctx.moveTo(start.x, start.y);
        tmp_ctx.lineTo(end.x, end.y);
        tmp_ctx.stroke();
        tmp_ctx.closePath();
    };

    /**
     * Paints a rectangle to the temp canvas.
     * @param a
     */
    var paintRectangle = function (a) {
        if (a == null || a == undefined) a = action;

        if (a.points.length == 1) return;

        var start = a.points[0],
            end = a.points[1];

        if (comparePoints(start, end)) return;

        tmp_ctx.lineCap = "round";
        tmp_ctx.lineJoin = "round";
        tmp_ctx.strokeStyle = game.color.rgbColorToHex(a.color);
        tmp_ctx.lineWidth = a.size;

        tmp_ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        var x = Math.min(end.x, start.x);
        var y = Math.min(end.y, start.y);
        var width = Math.abs(end.x - start.x);
        var height = Math.abs(end.y - start.y);
        tmp_ctx.strokeRect(x, y, width, height);
    };

    /**
     * Paints a circle to the temp canvas.
     * @param a
     */
    var paintCircle = function (a) {
        if (a.points.length == 1) return;

        var origo = a.points[0],
            end = a.points[1];

        if (comparePoints(origo, end)) return;

        tmp_ctx.strokeStyle = game.color.rgbColorToHex(a.color);
        tmp_ctx.lineWidth = a.size;

        tmp_ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        var radius = Math.sqrt(Math.pow(Math.abs(origo.x - end.x), 2) + Math.pow(Math.abs(origo.y - end.y), 2));
        tmp_ctx.beginPath();
        tmp_ctx.arc(origo.x, origo.y, radius, 0, Math.PI * 2);
        tmp_ctx.stroke();
        tmp_ctx.closePath();
    };

    /**
     * Paints a triangle to the temp canvas.
     * @param a
     */
    var paintTriangle = function (a) {
        if (a.points.length == 1) return;

        var origo = a.points[0],
            end = a.points[1];

        if (comparePoints(origo, end)) return;

        tmp_ctx.lineCap = "round";
        tmp_ctx.lineJoin = "round";
        tmp_ctx.strokeStyle = game.color.rgbColorToHex(a.color);
        tmp_ctx.lineWidth = a.size;

        tmp_ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        var dX = origo.x - end.x;
        var dY = origo.y - end.y;
        var d = dY > 0 ? -1 : 1;
        var radius = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
        var distance = Math.sqrt(Math.pow(dX + radius, 2) + Math.pow(dY, 2)) / 2;
        var angle = d * 2 * Math.asin(distance / radius);
        tmp_ctx.beginPath();
        tmp_ctx.moveTo(radius * Math.cos(angle) + origo.x, radius * Math.sin(angle) + origo.y);
        for (var i = 0; i < 3; i++) {
            angle += 2 / 3 * Math.PI;
            tmp_ctx.lineTo(radius * Math.cos(angle) + origo.x, radius * Math.sin(angle) + origo.y);
        }
        tmp_ctx.stroke();
        tmp_ctx.closePath();
    };

    /**
     * Starts painting with paint bucket tool to the main canvas, if every condition is met.
     * @param a
     */
    var paintRegion = function (a) {
        shouldFill = true;
        var posX = a.points[0].x;
        var posY = a.points[0].y;

        var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        var pixelPos = (posY * canvasWidth + posX) * 4;
        var sColor = {
            r: imageData.data[pixelPos],
            g: imageData.data[++pixelPos],
            b: imageData.data[++pixelPos]
        };

        if (sColor.r === a.color.r && sColor.g === a.color.g && sColor.b === a.color.b) {
            shouldFill = false;
            return;
        }

        var pixelStack = [
            [posX, posY]
        ];

        while (pixelStack.length) {
            var newPos, x, y, reachLeft, reachRight;
            newPos = pixelStack.pop();
            x = newPos[0];
            y = newPos[1];

            // Get current pixel position
            pixelPos = (y * canvasWidth + x) * 4;

            // Go up as long as the color matches and are inside the canvas
            while (y >= 0 && game.color.match(pixelPos, imageData, sColor)) {
                y--;
                pixelPos -= canvasWidth * 4;
            }

            pixelPos += canvasWidth * 4;
            y++;
            reachLeft = false;
            reachRight = false;

            // Go down as long as the color matches and in inside the canvas
            while (y < canvasHeight - 1 && game.color.match(pixelPos, imageData, sColor)) {
                y++;
                game.color.colorPixel(pixelPos, imageData, a.color);

                if (x > 0) {
                    if (game.color.match(pixelPos - 4, imageData, sColor)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    }
                    else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (x < canvasWidth - 1) {
                    if (game.color.match(pixelPos + 4, imageData, sColor)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    }
                    else if (reachRight) {
                        reachRight = false;
                    }
                }

                pixelPos += canvasWidth * 4;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    /**
     * Resets the canvas to the starting state.
     */
    var resetCanvas = function () {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    };

    /**
     * Paint the action based on the tool.
     * @param a
     */
    var paintAction = function (a) {
        if (a.tool == Tool.PENCIL || a.tool == Tool.ERASER) {
            paintCurve(a);
        } else if (a.tool == Tool.PAINT_BUCKET) {
            paintRegion(a);
        } else if (a.tool == Tool.CIRCLE) {
            paintCircle(a);
        } else if (a.tool == Tool.LINE) {
            paintLine(a);
        } else if (a.tool == Tool.RECTANGLE) {
            paintRectangle(a);
        } else if (a.tool == Tool.TRIANGLE) {
            paintTriangle(a);
        }
    };

    /**
     * Redraws every action from the action array.
     */
    var redrawActions = function () {
        resetCanvas();
        for (var i = 0; i < actions.length; i++) {
            var a = actions[i];
            paintAction(a);
            saveTemp();
        }
    };

    //-------------------------------------------------------------------------
    // Public methods
    //-------------------------------------------------------------------------

    /**
     * Initializes the canvas and temp canvas.
     */
    var init = function () {
        if (debug) console.log("Init");

        j_canvas = $("#canvas");
        canvas = j_canvas[0];
        ctx = canvas.getContext('2d');

        j_tmp_canvas = $("#tmp-canvas");
        tmp_canvas = j_tmp_canvas[0];
        tmp_ctx = tmp_canvas.getContext('2d');

        j_tmp_canvas.on('click ' +
        'mousemove ' +
        'mousedown ' +
        'mouseup ' +
        'mouseleave ' +
        'mouseout ' +
        'touchstart ' +
        'touchmove ' +
        'touchend ' +
        'touchcancel', onEvent);

        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        changeTool(Tool.PENCIL);
        changeSize(Size.S);
        setupRequestFrame();
        resetCanvas();
    };

    /**
     * Clears the canvas and actions.
     */
    var clear = function () {
        resetCanvas();
        actions = [];
        action = [];
    };

    /**
     * Undoes the last action.
     */
    var undoAction = function () {
        var length = actions.length;

        if (length > 0) {
            actions.pop();
            redrawActions();
        }
    };

    var changeColor = function (c) {
        switch (tool) {
            case Tool.ERASER:
            case Tool.EYEDROPPER:
                changeTool(Tool.PENCIL);
        }
        game.core.tools.color_sample.css('background-color', c);
        console.log("New color: " + c);
        color = game.color.hexToRgb(c);
    };

    var changeSize = function (s) {
        switch (s) {
            case Size.S:
            case Size.M:
            case Size.L:
                game.core.tools[size.name].css("border-color", "black");
                game.core.tools[s.name].css("border-color", "rgb(195, 75, 75)");
                console.log("New size: " + s.name);
                size = s;
        }
    };

    var changeTool = function (t) {
        switch (t) {
            case Tool.CIRCLE:
            case Tool.ERASER:
            case Tool.EYEDROPPER:
            case Tool.LINE:
            case Tool.PAINT_BUCKET:
            case Tool.PENCIL:
            case Tool.RECTANGLE:
            case Tool.TRIANGLE:
                game.core.tools[tool].css("background-image", "url('res/" + tool + ".png')");
                game.core.tools[t].css("background-image", "url('res/" + t + "_active.png')");
                console.log("New tool: " + t);
                tool = t;
                break;
        }
    };

    return {
        change: {
            color: changeColor,
            size: changeSize,
            tool: changeTool
        },
        clear: clear,
        init: init,
        undo: undoAction
    }
})();

