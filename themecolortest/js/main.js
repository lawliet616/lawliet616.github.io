function updateMetaThemeColor(theme) {
    var themeColor;
    switch(theme){
        case 0:
            themeColor = '#f4dcdc';
            break;
        case 1:
            themeColor = '#f0e8dd';
            break;
        case 2:
            themeColor = '#d5e7f0';
            break;
        case 3:
            themeColor = '#f6efb9';
            break;
        case 4:
            themeColor = '#eaeae8';
            break;
        case 5:
            themeColor = '#f8e3c7';
            break;
        case 6:
            themeColor = '#cde8e8';
            break;
        case 7:
            themeColor = '#000000';
            break;
        default:
            themeColor = '#ffffff';
    }

    //remove the current meta
    $('meta[name=theme-color]').remove();
    //add the new one
    $('head').append('<meta name="theme-color" content="'+themeColor+'">');
}

$("#0").click(function(event) {
    updateMetaThemeColor(0);
});
$("#1").click(function(event) {
    updateMetaThemeColor(1);
});
$("#2").click(function(event) {
    updateMetaThemeColor(2);
});
$("#3").click(function(event) {
    updateMetaThemeColor(3);
});
$("#4").click(function(event) {
    updateMetaThemeColor(4);
});
$("#5").click(function(event) {
    updateMetaThemeColor(5);
});
$("#6").click(function(event) {
    updateMetaThemeColor(6);
});
$("#7").click(function(event) {
    updateMetaThemeColor(7);
});


var meta = document.querySelector('meta[name="theme-color"]');
if (meta) {
    var ob = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.type === "attributes" && m.attributeName === "theme-color") {
              console.log("theme changed " + m + " " + meta);
            }
        });
    });
    ob.observe(meta, {attributes:true});
}