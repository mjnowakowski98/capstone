var c;
var ctx;

addEventListener("load", function() {
    c = document.getElementById("canvas");
    ctx = c.getContext("2d");
});

function setCanvasSize(w = 8000, h = 8000) {
    canvas.width = w;
    canvas.height = h;
}