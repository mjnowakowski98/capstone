class CircleTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Circle";
    }

    handleCanvasMouseDown() {
        if(this.toolStateString === "toolReady")
            this.toolStateString = "toolActive";
    }

    handleCanvasMouseUp() {
        if(this.toolStateString === "toolActive")
            this.toolStateString = "toolEnding";
    }

    onToolEnding() {
        var newObj = new Drawable("circle", "Circle");
        if(Tool.useFill) newObj.fill = Tool.fillColor;
        if(Tool.useStroke) {
            newObj.stroke = Tool.strokeColor;
            newObj.strokeWidth = Tool.strokeWidth;
        }

        newObj.radius = Utilities.getDistance(Input.mouseHoldStart, Input.mouseHoldEnd);

        var objRef = renderer.anim.addObject(newObj);
        renderer.anim.addObjectToFrame(renderer.animFrame, "drawable", objRef, Input.mouseHoldStart.x, Input.mouseHoldStart.y);

        this.toolStateString = "toolWaiting";
    }

    onToolCancel() {
        this.toolStateString = "toolWaiting";
    }

    onFrame() {
        if(this.toolStateString === "toolActive") {
            var shadow = new Drawable("circle");
            shadow.fill = null;
            shadow.stroke = "#00000";
            shadow.strokeWidth = 1;

            shadow.radius = Utilities.getDistance(Input.mouseHoldStart, Input.mouseCurrent);
            Anim.drawShape(renderer.anim.ctx, shadow, Input.mouseHoldStart.x, Input.mouseHoldStart.y)
        }
    }
}