class Utilities { // Small functions for common actions
    static getDistance(coord1, coord2) {
        var x2 = Math.pow(coord2.x - coord1.x, 2);
        var y2 = Math.pow(coord2.y - coord1.y, 2);
        return Math.sqrt(x2 + y2);
    }

    static getBoundingCenter(obj) {
        let center = new Coord(0, 0);
        switch(obj.shape) {
            case "rect":
                center.x = obj.width / 2;
                center.y = obj.height / 2;
                break;
            case "path":
                let top = obj.points[0].y;
                let bottom = obj.points[0].y;
                let left = obj.points[0].x;
                let right = obj.points[0].x;
                for (let i = 1; i < obj.points.length; i++) {
                    if (obj.points[i].y < top) top = obj.points[i].y;
                    else if (obj.points[i].y > bottom) bottom = obj.points[i].y;

                    if (obj.points[i].x < left) left = obj.points[i].x;
                    else if (obj.points[i].x > right) right = obj.points[i].x;
                }
                center.x = ((right - left) / 2) + left;
                center.y = ((bottom - top) / 2) + top;

                var ctx = renderer.anim.ctx;
                ctx.save();
                ctx.strokeStyle = "#FF0000";
                ctx.fillStyle = "#00FF00";
                ctx.strokeRect(left, top, right - left, bottom - top);
                ctx.beginPath();
                ctx.arc(center.x, center.y, 5, 0, Math.PI*2, false);
                ctx.fill();
                ctx.restore();
                break;
            default:
                break;
        }
        return center;
    }

    static quickSave() {
        Cookies.set("animTempSave", renderer.anim.getSaveString(), { expires: 1 });
        console.log(Cookies.get("animTempSave"));
    }

    static quickLoad() {
        dom.loadAnimationFile(Cookies.get("animTempSave"));
    }
}