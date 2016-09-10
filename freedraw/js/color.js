var game = game || {};
game.color = (function () {

    var componentToHex = function (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    var rgbToHex = function (r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    var rgbColorToHex = function (color) {
        return rgbToHex(color.r, color.g, color.b);
    };

    var hexToRgbColor = function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    var pixelPosToRgbColor = function (pixelPos, data) {
        return {
            r: data.data[pixelPos],
            g: data.data[pixelPos + 1],
            b: data.data[pixelPos + 2]
        }
    };
    var matchStartColor = function (pixelPos, data, color) {
        var pColor = pixelPosToRgbColor(pixelPos, data);

        return (pColor.r == color.r && pColor.g == color.g && pColor.b == color.b);
    };

    var colorPixel = function (pixelPos, data, color) {
        data.data[pixelPos] = color.r;
        data.data[pixelPos + 1] = color.g;
        data.data[pixelPos + 2] = color.b;
        data.data[pixelPos + 3] = 255;
    };


    return {
        rgbToHex: rgbToHex,
        rgbColorToHex: rgbColorToHex,
        hexToRgb: hexToRgbColor,
        match: matchStartColor,
        colorPixel: colorPixel,
        pixelToColor: pixelPosToRgbColor
    }
})();