class PathTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Rectangle";

        this.m_points = null;
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
        addEventListener("keyup", function endPath(evt) {
            if(evt.keyCode === 13)
                self.toolStateString = "toolEnding";
        });
    }

    onToolEnding() {
        removeEventListener("keyup", this.endPath);
        var newObj = new Drawable("path", "Path");
        newObj.fill = "#a3a3a3";
        newObj.stroke = null;
        newObj.points = new Array();
        for(var i in this.m_points)
            newObj.points.push(this.m_points[i]);

        Anim.drawShape(renderer.anim.ctx, newObj);

        var intersects = new Array();
        for(var i = 0; i < newObj.points.length; i++) {
            var p1 = Object.assign({}, newObj.points[i]), p2;
            if(i + 1 === newObj.points.length) p2 = Object.assign({}, newObj.points[0]);
            else p2 = Object.assign({}, newObj.points[i + 1]);

            if(p1.x === p2.x || p1.y === p2.y) continue;

            var tmp = p2.x;
            p2.x = p1.x;
            p1.x = tmp;

            if(renderer.anim.ctx.isPointInPath(p1.x, p1.y))
                intersects.push(p1);
            else if(renderer.anim.ctx.isPointInPath(p2.x, p2.y))
                intersects.push(p2);
        }

        console.log(intersects);

        var intCenter = null,
            pointCenter = null,
            avgCenter = null;
        var avgX = 0, avgY = 0;
        for(var i in newObj.points) {
            avgX += newObj.points[i].x;
            avgY += newObj.points[i].y;
        }
        avgX /= intersects.length;
        avgY /= intersects.length;
        pointCenter = new Coord(avgX, avgY);

        if(intersects.length > 0) {
            avgX = 0;
            avgY = 0;
            for(var i in intersects) {
                avgX += intersects[i].x;
                avgY += intersects[i].y;
            }

            avgX /= intersects.length;
            avgY /= intersects.length;
            intCenter = new Coord(avgX, avgY);
        }

        if(intCenter && renderer.anim.ctx.isPointInPath(pointCenter.x, pointCenter.y))
            avgCenter = new Coord((intCenter.x + pointCenter.x) / 2, (intCenter.y + pointCenter.y) / 2);

        console.log(intCenter, pointCenter, avgCenter);

        return;

        if(Tool.useFill) newObj.fill = Tool.fillColor;
        if(Tool.useStroke) {
            newObj.stroke = Tool.strokeColor;
            newObj.strokeWidth = Tool.strokeWidth;
        }

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