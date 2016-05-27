var metas = document.getElementsByTagName('meta'); 
var target;
for (var i=0; i<metas.length; i++) { 
    if (metas[i].getAttribute("name") == "theme-color") { 
        target = metas[i];
        break;
    } 
} 
// create an observer instance
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log(target.getAttribute("content"));
    console.log("m",mutation);
    console.log("m" + mutation.target.content);
  });    
});
 
// configuration of the observer:
var config = { attributes: true };
 
// pass in the target node, as well as the observer options
observer.observe(target, config);

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

    target.setAttribute("content", themeColor);
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

