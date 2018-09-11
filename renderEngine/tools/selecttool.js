class SelectTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Select";

        this.m_hasObject = false;
        this.m_object = null;

        this.m_isDragging = false;

        this.m_timeout = null;
    }

    get hasObject() { return this.m_hasObject; }
    get selectedObject() { return this.m_object; }

    get isDragging() { return this.m_isDragging; }

    handleCanvasMouseDown() {
        var self = this;
        if(this.toolStateString === "toolReady" && this.hasObject
            && this.testPoint(this.selectedObject, Input.mouseHoldStart)) {
            this.m_timeout = setTimeout(function() {
                self.m_isDragging = true;
                self.m_timeout = null;
            }, 150);
        }
    }

    handleCanvasMouseUp() {
        if(this.m_timeout) {
            clearTimeout(this.m_timeout);
            return;
        }

        if(this.toolStateString === "toolReady" && this.hasObject && this.isDragging)
            this.m_isDragging = false;
    }

    handleCanvasClick() {
        if(this.toolStateString != "toolReady") return;
        var frameObjects = renderer.anim.frames[renderer.animFrame].onScreen;

        for(var i in frameObjects) {
            if(this.testPoint(frameObjects[i])) {
                this.selectObject(frameObjects[i]);
                return;
            }
        }
        this.selectObject(null);
    }

    selectObject(obj) {
        if(!obj) {
            this.m_hasObject = false;
            this.m_object = null;
        } else {
            this.m_hasObject = true;
            this.m_object = obj;
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