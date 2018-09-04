class RectangleTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Rectangle";
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
        var newObj = new Drawable("rect", "Rectangle");
        if(Tool.useFill) newObj.fill = Tool.fillColor;
        if(Tool.useStroke) {
            newObj.stroke = Tool.strokeColor;
            newObj.strokeWidth = Tool.strokeWidth;
        }

        newObj.width = Input.mouseHoldEnd.x - Input.mouseHoldStart.x;
        newObj.height = Input.mouseHoldEnd.y - Input.mouseHoldStart.y;
        if(Math.abs(newObj.width) <= 2 || Math.abs(newObj.height) <= 2) return;

        var objRef = renderer.anim.addObject(newObj);
        var x = (newObj.width / 2) + Input.mouseHoldStart.x;
        var y = (newObj.height / 2) + Input.mouseHoldStart.y;
        renderer.anim.addObjectToFrame(renderer.animFrame, "drawable", objRef, x, y);

        renderer.shadowShape = null;
        this.toolStateString = "toolWaiting";
    }

    onToolCancel() {
        this.toolStateString = "toolWaiting";
    }

    onFrame() {  
        if(this.toolStateString === "toolActive") {
            var shadow = new Drawable("rect");
            shadow.fill = null;
            shadow.stroke = "#000000";
            shadow.strokeWidth = 1;

            shadow.width = Input.mouseCurrent.x - Input.mouseHoldStart.x;
            shadow.height = Input.mouseCurrent.y - Input.mouseHoldStart.y;
            var x = (shadow.width / 2) + Input.mouseHoldStart.x;
            var y = (shadow.height / 2) + Input.mouseHoldStart.y;

            Anim.drawShape(renderer.anim.ctx, shadow, x, y);
        }
    }
}