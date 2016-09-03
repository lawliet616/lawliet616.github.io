var game = game || {};
game.core = function () {
    var undo = $("#undo");
    var clear = $("#clear");
    var small = $("#small");
    var medium = $("#medium");
    var large = $("#large");

    $(document).ready(function () {
        undo.click(game.draw.undo);
        clear.click(game.draw.clear);
        small.click(game.draw.change.size.bind(this, Size.S));
        medium.click(game.draw.change.size.bind(this, Size.M));
        large.click(game.draw.change.size.bind(this, Size.L));
        game.draw.init();
    });
}();