// This is still a steamy POS

class DOM {
    constructor() {
        // Register initial tools
        this.m_tools = [
            {
                "ref":new Tool(),
                "element":null
            },
            {
                "ref":new SelectTool(),
                "element":document.getElementById("tool-select")
            },
            {
                "ref":new RectangleTool(),
                "element":document.getElementById("tool-rectangle")
            },
            {
                "ref":new CircleTool(),
                "element":document.getElementById("tool-circle")
            },
            {
                "ref":new PathTool(),
                "element":document.getElementById("tool-path")
            },
            {
                "ref":new DeleteTool(),
                "element":document.getElementById("tool-delete")
            }
        ];

        this.currentTool = "none"; // Tool controller
    }

    // Accessor/Mutator for tool controller
    get tools() { return this.m_tools; }
    get currentTool() { return this.m_currentTool; }
    set currentTool(toolName) {
        if(this.getToolByName(toolName) === this.currentTool)
            toolName = "none";
            
        // Match passed in toolname to known tools
        var foundTool = false;
        for(var i in this.m_tools) {
            if(this.tools[i].ref.name === toolName) {
                if(this.currentTool) // Tell current tool it can't finish
                    this.currentTool.ref.toolStateString = "toolCancel";

                this.m_currentTool = this.tools[i];
                foundTool = true;
            }
        }
        // Check if found
        if (!foundTool && toolName !== "none") console.error("Cannot set currentTool: " + toolName);
        else {
            this.currentTool.ref.toolStateString = "toolReady"; // Tell tool it's selected

            // Set tool background as green
            if(this.currentTool.element) {
                this.currentTool.element.classList.add("btn-success");
                this.currentTool.element.classList.remove("btn-outline-primary");
            }

            // Set other tools to transparent
            for (var j in this.tools) {
                if (this.tools[j] !== this.currentTool && this.tools[j].element) {
                    this.tools[j].element.classList.remove("btn-success");
                    this.tools[j].element.classList.add("btn-outline-primary");
                }
            }
        }
    }

    toggleTools(state = null) {
        var tools = document.getElementsByClassName("tool");
        for (var i = 0; i < tools.length; i++) {
            if(state === null) tools[i].disabled = !tools[i].disabled;
            else if(state) tools[i].disabled = false;
            else tools[i].disabled = true;
        }
    }

    getToolByName(name) {
        for(var i in this.m_tools) {
            if(this.m_tools[i].ref.name === name)
                return this.m_tools[i];
        }
        return null;
    }

    generateObjectViewDrawable() {
        var container = document.getElementById("object-list-drawable-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(let i in renderer.anim.drawable) {
            let obj = renderer.anim.drawable[i];
            let newDiv = document.createElement("div");
            newDiv.classList.add("object-list-item");
            if(!(i % 2)) {
                newDiv.classList.add("text-black");
                newDiv.classList.add("bg-light");
            } else {
                newDiv.classList.add("text-white")
                newDiv.classList.add("bg-dark");
            }

            let newP = document.createElement("p");
            newP.appendChild(document.createTextNode(obj.name));
            newP.classList.add("my-0");
            newDiv.appendChild(newP);
            container.appendChild(newDiv);

            newDiv.addEventListener("click", function() {
                var c = renderer.anim.ctx.canvas;
                var scrCenterX = c.scrollLeft + (c.width / 2);
                var scrCenterY = c.scrollTop + (c.height / 2);
                renderer.anim.addObjectToFrame(renderer.animFrame, "drawable", i, scrCenterX, scrCenterY);
            });
        }
    }

    generateObjectViewFrame() {
        var container = document.getElementById("object-list-frame-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(let i in renderer.anim.frames[renderer.animFrame].onScreen) {
            let obj = renderer.anim.frames[renderer.animFrame].onScreen[i];
            if(obj.objCat !== "drawable") continue;

            let newDiv = document.createElement("div");
            newDiv.classList.add("object-list-item");
            if(!(i % 2)) {
                newDiv.classList.add("text-black");
                newDiv.classList.add("bg-light");
            } else {
                newDiv.classList.add("text-white");
                newDiv.classList.add("bg-dark");
            }

            let name = obj.instanceName;
            (name) ? name = name : name = renderer.anim.drawable[obj.objRef].name;
            let newP = document.createElement("p");
            newP.classList.add("my-0");
            newP.appendChild(document.createTextNode(name));
            newDiv.appendChild(newP);
            container.appendChild(newDiv);

            newDiv.addEventListener("click", function() { dom.getToolByName("Select").ref.selectObject(obj); });
        }
    }

    generateFrameView() {
        var container = document.getElementById("frame-view-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(let i in renderer.anim.frames) {
            let newFrame = document.createElement("div");
            newFrame.appendChild(document.createTextNode(i));
            newFrame.id = "frame" + i;
            newFrame.classList.add("frame-box", "d-inline-block", "bg-light", "my-1", "mr-1", "btn",  "btn-outline-primary");
            newFrame.addEventListener("click", function() { renderer.scrubFrames(i - renderer.animFrame); });
            container.appendChild(newFrame);
        }
    }

    setTitleMarquee() {
        var animTitle = document.getElementById("anim-title");
        animTitle.innerHTML = renderer.anim.animName;
        if(animTitle.scrollWidth > animTitle.clientWidth) animTitle.classList.add("marquee");
        else animTitle.classList.remove("marquee");
    }

    initListeners() { // Initialize event listeners for DOM actions
        // Initialize toolbox
        for(var i = 0; i < this.m_tools.length; i++) {
            let toolName = this.m_tools[i].ref.name;
            let elem = this.m_tools[i].element;
            if(elem) elem.addEventListener("click", function() {
                if(dom.currentTool !== dom.getToolByName(toolName)) {
                    dom.currentTool = toolName;
                    dom.currentTool.ref.toolStateString = "toolReady";
                } else dom.currentTool = "none";
            });
        }

        // Editor Frame
        addEventListener("frame", function() {
            for(var i in dom.tools)
                dom.tools[i].ref.onFrame();
        });

        addEventListener("resize", function() {
            dom.setTitleMarquee();
        });

        // Change fill/stroke settings
        var fillSelector = document.getElementById("fill-stroke-modal-fill-color");
        fillSelector.addEventListener("change", function() { Tool.fillColor = fillSelector.value; });
        var strokeSelector = document.getElementById("fill-stroke-modal-stroke-color");
        strokeSelector.addEventListener("change", function() { Tool.strokeColor = strokeSelector.value; });
        var useFill = document.getElementById("fill-stroke-modal-use-fill");
        useFill.addEventListener("change", function() { Tool.useFill = useFill.checked; });
        var useStroke = document.getElementById("fill-stroke-modal-use-stroke");
        useStroke.addEventListener("change", function() { Tool.useStroke = useStroke.checked; });
        var strokeWidth = document.getElementById("fill-stroke-modal-stroke-width");
        strokeWidth.addEventListener("change", function() { Tool.strokeWidth = strokeWidth.valueAsNumber; });

        // Save Animation
        document.getElementById("am-save-animation-modal-save").addEventListener("click", function() {
            renderer.anim.animName = document.getElementById("am-save-animation-modal-filename").value;

            var dLink = document.createElement("a");
            dLink.setAttribute("href", "data:application/json, " + encodeURIComponent(renderer.anim.getSaveString()));
            dLink.setAttribute('download', renderer.anim.animName);

            if(document.createEvent) {
                var event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                dLink.dispatchEvent(event);
            } else dLink.click();
        });

        // Load anim/object files
        document.getElementById("am-load-animation-modal-loadfile-submit").addEventListener("click", function() { dom.loadAnimationFile(); });

        // Save Project Settings
        document.getElementById("am-project-settings-modal-save").addEventListener("click", function() {
            renderer.anim.animName = document.getElementById("am-project-settings-modal-anim-name").value;
            renderer.anim.backgroundColor = document.getElementById("am-project-settings-modal-bg-color").value;
            renderer.anim.framesPerSecond = document.getElementById("am-project-settings-modal-fps").value;
            renderer.anim.width = document.getElementById("am-project-settings-modal-width").value;
            renderer.anim.height = document.getElementById("am-project-settings-modal-height").value;
            dom.setTitleMarquee();
        });

        // Canvas events
        var canvas = document.getElementById("canvas");
        addEventListener("mousemove", function(evt) { Input.mouseCurrent = Input.getMousePos(canvas, evt); });

        // Set click position/inform tool
        canvas.addEventListener("click", function(evt) {
            Input.click = Input.getMousePos(canvas, evt);
            dom.currentTool.ref.handleCanvasClick();
        });

        // Set mouse holding position
        canvas.addEventListener("mousedown", function(evt) {
            Input.mouseHoldStart = Input.getMousePos(canvas, evt);
            dom.currentTool.ref.handleCanvasMouseDown();
        });

        // Set mouse release position
        canvas.addEventListener("mouseup", function(evt) {
            Input.mouseHoldEnd = Input.getMousePos(canvas, evt);
            dom.currentTool.ref.handleCanvasMouseUp();
        });

        // Player controls
        document.getElementById("fc-playback-start").addEventListener("click", function() { renderer.playbackMode = true; });

        document.getElementById("fc-playback-stop").addEventListener("click", function() { renderer.playbackMode  = false; });

        document.getElementById("fc-add-blank-frame").addEventListener("click", function() { renderer.anim.addFrame(renderer.animFrame); });
        document.getElementById("fc-add-copy-frame").addEventListener("click", function() { renderer.anim.addFrame(renderer.animFrame, true); });
        document.getElementById("fc-remove-frame").addEventListener("click", function() { renderer.anim.removeFrame(renderer.animFrame); });
    }

    loadAnimationFile() { // Read an animation file
        var fileList = document.getElementById("am-load-animation-modal-loadfile").files;
        var fr = new FileReader();
        fr.readAsText(fileList[0]);
        fr.addEventListener("loadend", function() {
            // Replace current animation
            var animFile = JSON.parse(fr.result);
            renderer.anim = new Anim(animFile);
            dom.generateFrameView();
            dom.generateObjectViewDrawable();
        });
    }

    loadObjectFile() { // Read an object file
        var fileList = dom.objSubmit.files;
        var fr = new FileReader();
        fr.readAsText(fileList[0]);
        fr.addEventListener("loadend", function() {
            // Add to animation
            var newObj = JSON.parse(fr.result);
            renderer.anim.addObject(newObj);
        });
    }

    static getInstance() { // Get singleton instance
        if(!DOM.uniqueInstance) DOM.uniqueInstance = new DOM();
        return DOM.uniqueInstance;
    }
}

DOM.uniqueInstance = null;