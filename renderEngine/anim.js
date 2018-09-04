// Default structure for drawable objects
function Drawable(shape, name = "", fill = null, stroke = null, strokeWidth = 1) {
    this.shape = shape; // Shape used to draw object
    this.name = name; // Object friendly name
    this.drawable = true; // Object is drawable

    this.fill = fill;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
}

// Default structure for container objects
function Container(name = "", contains = []) {
    this.name = name;
    this.drawable = false;
    this.contains = contains;
}

// Default structure for child object references
function ObjectDesc(objCat, objRef, xPos = 0, yPos = 0) {
    this.objCat = objCat; // Drawable or container
    this.objRef = objRef; // Array index of object
    
    // Position relative to parent
    this.xPos = xPos;
    this.yPos = yPos;
}

class Anim {
    constructor(animFile = null) {
        this.m_ctx = document.getElementById("canvas").getContext("2d");

        if(animFile) {
            this.animName = animFile.animName;
            this.backgroundColor = animFile.backgroundColor;
            this.framesPerSecond = animFile.framesPerSecond;
            this.width = animFile.width;
            this.height = animFile.height;

            this.m_objects = animFile.objects;
            this.m_frames = animFile.frames;
        } else {
            this.animName = "Untitled Animation";
            this.backgroundColor = "#FFFFFF";
            this.framesPerSecond = 60;
            this.width = 800;
            this.height = 600;

            this.m_objects = new Object();
            this.m_objects.drawable = new Array();
            this.m_objects.container = new Array();
            this.m_frames = new Array(new Object());
            this.m_frames[0].onScreen = new Array();
        }
    }

    get ctx() { return this.m_ctx; }

    get animName() { return this.m_animName; }
    set animName(newName) {
        this.m_animName = newName;
        document.getElementById("am-project-settings-modal-anim-name").value = this.animName;
        document.getElementById("am-save-animation-modal-filename").value = this.animName;
        document.getElementById("anim-title").innerHTML = this.animName;
    }

    get backgroundColor() { return this.m_backgroundColor; }
    set backgroundColor(newColor) {
        this.m_backgroundColor = newColor;
        document.getElementById("am-project-settings-modal-bg-color").value = this.backgroundColor;
        this.ctx.canvas.style.backgroundColor = this.backgroundColor;
    }

    get framesPerSecond() { return this.m_fps; }
    set framesPerSecond(newFps) {
        this.m_fps = newFps;
        renderer.framesPerSecond = this.framesPerSecond;
        document.getElementById("am-project-settings-modal-fps").value = this.framesPerSecond;
    }

    get width() { return this.m_width; }
    set width(newWidth) {
        this.m_width = newWidth;
        document.getElementById("am-project-settings-modal-width").value = this.width;
        this.ctx.canvas.width = this.width;
    }

    get height() { return this.m_height; }
    set height(newHeight) {
        this.m_height = newHeight;
        document.getElementById("am-project-settings-modal-height").value = this.height;
        this.ctx.canvas.height = this.height;
    }

    get drawable() { return this.m_objects.drawable; }
    get container() { return this.m_objects.container; }
    get frames() { return this.m_frames; }

    get numFrames() { return this.frames.length; }

    renderFrame(frameNdx) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(var i in this.frames[frameNdx].onScreen) {
            var o = this.frames[frameNdx].onScreen[i];
            if(o.objCat === "drawable")
                Anim.drawShape(this.ctx, this.drawable[o.objRef], o.xPos, o.yPos);
            else if(o.objCat === "container")
                this.drawObject(this.container[o.objRef], o.xPos, o.yPos);
            else console.error("Anim malformed: Object property 'objCat' is invalid");
        }
    }

    drawObject(tmp, xPos, yPos) {
        if(!tmp.drawable) {
            for(var ndx in tmp.contains) {
                var o = tmp.contains[ndx];
                if(o.objCat === "drawable")
                    Anim.drawShape(this.ctx, this.drawable[o.objRef], xPos + o.xPos, yPos + o.yPos);
                else if(o.objCat === "container")
                    this.drawObject(this.container[o.objRef], xPos + o.xPos, yPos + o.yPos);
                else console.error("Anim malformed: Object property 'objCat' is invalid");
            }
        } else console.error("Drawable objects should be passed to drawShape");
    }

    static drawShape(ctx, shape, xPos, yPos) {
        ctx.save();
        if(!shape.drawable) {
            console.error("Cannot draw shape: " + shape);
            return;
        }

        if(shape.fill) ctx.fillStyle = shape.fill;
        if(shape.stroke) {
            ctx.strokeStyle = shape.stroke;
            ctx.lineWidth = shape.strokeWidth;
        }
    
        ctx.beginPath();
        ctx.translate(xPos, yPos);

        // Draw supported shapes
        switch(shape.shape) {
            case "rect":
                ctx.rect(-(shape.width / 2), -(shape.height / 2), shape.width, shape.height);
                break;

            case "circle":
                ctx.arc(0, 0, shape.radius, 0, Math.PI*2);
                break;

            case "path":
                ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for(var i = 1; i < shape.points.length; i++)
                    ctx.lineTo(shape.points[i].x, shape.points[i].y);
                break;

            default:
                console.error("Shape type '" + shape.shape + "' is invalid");
                break;
        }

        ctx.closePath();
        if(shape.fill) ctx.fill();
        if(shape.stroke) ctx.stroke();
    
        ctx.restore();
    }

    getSaveString() {
        var newSave = new Object();
        newSave.animName = this.animName;
        newSave.backgroundColor = this.backgroundColor;
        newSave.framesPerSecond = this.framesPerSecond;
        newSave.width = this.width;
        newSave.height = this.height;

        newSave.objects = this.m_objects;
        newSave.frames = this.frames;

        return JSON.stringify(newSave);
    }

    addFrame(frameNdx, copy = false) {
        if(frameNdx < 0 || frameNdx >= this.frames.length) {
            console.error("New frame index is invalid");
            return;
        }

        this.frames.splice(frameNdx + 1, 0, new Object());
        this.frames[frameNdx + 1].onScreen = new Array();
        if(copy) {
            var newFrame = this.frames[frameNdx + 1].onScreen;
            var oldFrame = this.frames[frameNdx].onScreen;

            for(var i in oldFrame)
                newFrame[i] = Object.assign({}, oldFrame[i]);
        }

        renderer.scrubFrames(1);
        dom.generateFrameView();
    }

    removeFrame(frameNdx) {
        if(frameNdx < 0 || frameNdx >= this.frames.length) {
            console.error("Removing frame index is invalid");
            return;
        } else if(this.frames.length <= 1) {
            this.clearFrameObjects(frameNdx);
            return;
        }
        
        renderer.scrubFrames(-1);
        this.frames.splice(frameNdx, 1);
        dom.generateFrameView();
    }

    addObject(newObject) {
        var newLength = 0;
        if (newObject.drawable) newLength = this.m_objects.drawable.push(newObject);
        else newLength = this.m_objects.container.push(newObject);
        return newLength - 1;
    }

    addObjectToFrame(frameNdx, objCat, objRef, xPos = 0, yPos = 0) {
        var tmp = new ObjectDesc(objCat, objRef, xPos, yPos);
        this.frames[frameNdx].onScreen.push(tmp);
    }

    clearFrameObjects(frameNdx) {
        this.frames[frameNdx].onScreen = new Array();
    }
}