class SelectTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Select";

        this.m_hasObject = false;
        this.m_object = null;

        this.m_isDragging = false;
    }

    get hasObject() { return this.m_hasObject; }
    get selectedObject() { return this.m_object; }

    get isDragging() { return this.m_isDragging; }

    handleCanvasMouseDown() {
        if(this.toolStateString === "toolReady" && this.hasObject
            && this.testPoint(this.selectedObject)) this.m_isDragging = true;
    }

    handleCanvasMouseUp() {
        if(this.toolStateString === "toolReady" && this.hasObject
        && this.isDragging) {
            this.m_isDragging = false;
            this.toolStateString = "toolCancel";
        }
    }

    handleCanvasClick() {
        if(this.toolStateString != "toolReady") return;
        var frameObjects = renderer.anim.frames[renderer.animFrame].onScreen;

        for(var i in frameObjects) {
            if(this.testPoint(frameObjects[i])) {
                this.m_hasObject = true;
                this.m_object = frameObjects[i];
            }   
        }
    }

    testPoint(fObj, click = Input.click) {
        var result = false;

        if (fObj.objCat !== "drawable") return;
        var tmp = Object.assign({}, renderer.anim.drawable[fObj.objRef]);
        tmp.fill = null;
        tmp.stroke = null;

        Anim.drawShape(renderer.anim.ctx, tmp, fObj.xPos, fObj.yPos);
        if (renderer.anim.ctx.isPointInPath(click.x, click.y))
            result = true;

        return result;
    }

    onToolCancel() {
        this.m_hasObject = false;
        this.m_object = null;
        this.toolStateString = "toolWaiting";
    }

    onFrame() {
        if(this.hasObject) {
            var shadow = Object.assign({}, renderer.anim.drawable[this.selectedObject.objRef]);
            shadow.fill = null;
            shadow.stroke = "#007BFF";
            shadow.strokeWidth = 3;
            Anim.drawShape(renderer.anim.ctx, shadow, this.selectedObject.xPos, this.selectedObject.yPos)
        }

        if(this.isDragging) {
            this.selectedObject.xPos = Input.mouseCurrent.x;
            this.selectedObject.yPos = Input.mouseCurrent.y;
        }
    }
}