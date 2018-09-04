// Coordinate structure
function Coord(x, y) {
    this.x = x;
    this.y = y;
}

class Input {
    static getMousePos(canvas, evt) { // Get mouse position on canvas
        var rect = canvas.getBoundingClientRect();
        return new Coord(evt.clientX - rect.left, evt.clientY - rect.top);
    }
}

// Static properties for global access
Input.mouseHoldStart = new Coord(0, 0);
Input.mouseHoldEnd = new Coord(0, 0);
Input.click = new Coord(0, 0);
Input.mouseCurrent = new Coord(0, 0);