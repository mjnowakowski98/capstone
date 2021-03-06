class PathTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Path";

        this.m_points = null;

        this.m_endPath;
    }

    handleCanvasClick() {
        if(this.toolStateString === "toolReady") {
            this.m_points = new Array(Input.click);
            this.toolStateString = "toolActive";
        } else if(this.toolStateString === "toolActive")
            this.m_points.push(Input.click);
    }

    onToolActive() {
        var self = this;
        this.m_endPath = function(evt) {
            if(evt.keyCode === 13)
                self.toolStateString = "toolEnding";
        }
        addEventListener("keyup", this.m_endPath);
    }

    onToolEnding() {
        removeEventListener("keyup", this.m_endPath); // Remove tool finalize listener

        var newObj = new Drawable("path", "Path");
        newObj.points = this.m_points;

        // Translate object to origin
        var center = Utilities.getBoundingCenter(newObj);
        for(let i in newObj.points) {
            let point = newObj.points[i];
            point.x -= center.x;
            point.y -= center.y;
        }

        // Set colors
        if(Tool.useFill) newObj.fill = Tool.fillColor;
        if(Tool.useStroke) {
            newObj.stroke = Tool.strokeColor;
            newObj.strokeWidth = Tool.strokeWidth;
        }

        // Add new object to drawable list/frame list
        var objRef = renderer.anim.addObject(newObj);
        renderer.anim.addObjectToFrame(renderer.animFrame, "drawable", objRef, center.x, center.y);

        // End tool
        dom.currentTool = "none";
    }

    onToolCancel() {
        removeEventListener("keyup", this.m_endPath);
        this.toolStateString = "toolWaiting";
    }

    onFrame() {
        if(this.toolStateString === "toolActive") {
            var shadow = new Drawable("path");
            shadow.fill = null;
            shadow.stroke = "#000000";
            shadow.strokeWidth = 1;
            shadow.points = this.m_points;
            Anim.drawShape(renderer.anim.ctx, shadow);

            for(var i in this.m_points) {
                var pntShadow = new Drawable("circle")
                pntShadow.fill = "#007BFF";
                pntShadow.radius = 3;
                Anim.drawShape(renderer.anim.ctx, pntShadow, this.m_points[i].x, this.m_points[i].y);
            }
        }
    }
}