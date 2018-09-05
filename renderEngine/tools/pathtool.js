class PathTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Rectangle";

        this.m_newObj = null;
        this.m_points = null;
    }

    handleCanvasClick() {
        if(this.toolStateString === "toolReady") {
            this.m_points = new Array(Input.click);
            this.toolStateString = "toolActive";
        }

        if(this.toolStateString === "toolActive")
            this.m_points.push(Input.click);
    }

    onToolActive() {
        var self = this;
        addEventListener("keyup", function endPath(evt) {
            if(evt.keyCode === 13)
                self.toolStateString = "toolEnding";
        });
    }

    onToolEnding() {
        removeEventListener("keyup", this.endPath);
        var newObj = new Drawable("path", "Path");
        if(Tool.useFill) newObj.fill = Tool.fillColor;
        if(Tool.useStroke) {
            newObj.stroke = Tool.strokeColor;
            newObj.strokeWidth = Tool.strokeWidth;
        }

        var xTotal = 0;
        var yTotal = 0;
        for(var i in this.m_points) {
            xTotal += this.m_points[i].x;
            yTotal += this.m_points[i].y;
        }

        var center = new Coord(xTotal / this.m_points.length, yTotal / this.m_points.length);
        for(var i in this.m_points) {
            this.m_points[i].x = this.m_points[i].x - center.x;
            this.m_points[i].y = this.m_points[i].y - center.y;
        }

        newObj.points = new Array();
        for(var i in this.m_points)
            newObj.points[i] = Object.assign({}, this.m_points[i]);

        var objRef = renderer.anim.addObject(newObj);
        renderer.anim.addObjectToFrame(renderer.animFrame, "drawable", objRef, center.x, center.y);

        this.toolStateString = "toolWaiting";
        dom.currentTool = "none";
    }

    onToolCancel() {
        removeEventListener("keyup", this.endPath);
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