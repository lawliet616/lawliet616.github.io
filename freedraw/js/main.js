var game = game || {};
game.core = (function () {
    var tools = {
        undo: $("#undo"),
        clear: $("#clear"),

        small: $("#small"),
        medium: $("#medium"),
        large: $("#large"),

        pencil: $("#pencil"),
        eraser: $("#eraser"),
        paint_bucket: $("#paint-bucket"),
        eyedropper: $("#eyedropper"),
        line: $("#line"),
        circle: $("#circle"),
        triangle: $("#triangle"),
        rectangle: $("#rectangle"),

        color_sample: $("#color-sample"),
        color_text: $("#color-text")
    };


    $(document).ready(function () {
        if (debug) console.log("Resources loaded");

        tools.undo.click(game.draw.undo);
        tools.clear.click(game.draw.clear);

        tools.small.click(game.draw.change.size.bind(this, Size.S));
        tools.medium.click(game.draw.change.size.bind(this, Size.M));
        tools.large.click(game.draw.change.size.bind(this, Size.L));

        tools. pencil.click(game.draw.change.tool.bind(this, Tool.PENCIL));
        tools.eraser.click(game.draw.change.tool.bind(this, Tool.ERASER));
        tools.paint_bucket.click(game.draw.change.tool.bind(this, Tool.PAINT_BUCKET));
        tools.eyedropper.click(game.draw.change.tool.bind(this, Tool.EYEDROPPER));

        tools.line.click(game.draw.change.tool.bind(this, Tool.LINE));
        tools.circle.click(game.draw.change.tool.bind(this, Tool.CIRCLE));
        tools.triangle.click(game.draw.change.tool.bind(this, Tool.TRIANGLE));
        tools.rectangle.click(game.draw.change.tool.bind(this, Tool.RECTANGLE));

        game.draw.init();
    });

    return{
        tools: tools
    }
})();