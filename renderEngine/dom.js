// This is still a steamy POS
//-----------------------------
// 9/18/18 Early morning edit
// Destroy this file after SE264

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

        for(let i = 0; i < renderer.anim.drawable.length; i++) {
            let obj = renderer.anim.drawable[i];
            if(!obj) continue;

            let newDiv = document.createElement("div");
            newDiv.classList.add("object-list-item", "d-flex", "justify-content-left");

            let newInp = document.createElement("input");
            newInp.setAttribute("type", "text");
            newInp.setAttribute("value", obj.name);
            newInp.classList.add("my-0", "border-0");
            if(!(i % 2)) {
                newDiv.classList.add("text-black", "bg-light");
                newInp.classList.add("text-black", "bg-light");
            } else {
                newDiv.classList.add("text-white", "bg-dark");
                newInp.classList.add("text-white", "bg-dark");
            }
            newDiv.appendChild(newInp);

            let copyIcn = document.createElement("button");
            copyIcn.classList.add("copy-icon", "btn", "btn-outline-primary", "mx-1");
            copyIcn.setAttribute("type", "button");
            newDiv.appendChild(copyIcn);

            let delIcn = document.createElement("button");
            delIcn.classList.add("del-icon", "btn", "btn-outline-danger");
            delIcn.setAttribute("type", "button");
            newDiv.appendChild(delIcn);
            container.appendChild(newDiv);

            newInp.addEventListener("change", function() {
                renderer.anim.drawable[i].name = newInp.value;
                dom.generateObjectViewFrame();
            });

            copyIcn.addEventListener("click", function() {
                var c = renderer.anim.ctx.canvas;
                var scrCenterX = c.scrollLeft + (c.width / 2);
                var scrCenterY = c.scrollTop + (c.height / 2);
                renderer.anim.addObjectToFrame(renderer.animFrame, "drawable", i, scrCenterX, scrCenterY);
            });

            delIcn.addEventListener("click", function() {
                for(let frameNdx = 0; frameNdx < renderer.anim.frames.length; frameNdx++) {
                    let frame = renderer.anim.frames[frameNdx];
                    for(let scrNdx = frame.onScreen.length - 1; scrNdx >= 0; scrNdx--) {
                        let obj = frame.onScreen[scrNdx];
                        if(obj.objCat === "drawable" && obj.objRef === i)
                            frame.onScreen.splice(scrNdx, 1);
                    }
                }

                dom.getToolByName("Select").ref.selectObject(null);
                renderer.anim.drawable[i] = null;
                dom.generateObjectViewFrame();
                dom.generateObjectViewDrawable();
            });
        }
    }

    generateObjectViewFrame() {
        var container = document.getElementById("object-list-frame-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(let i = 0; i < renderer.anim.frames[renderer.animFrame].onScreen.length; i++) {
            let obj = renderer.anim.frames[renderer.animFrame].onScreen[i];
            if(obj.objCat !== "drawable") continue;

            let newDiv = document.createElement("div");
            newDiv.classList.add("object-list-item");

            let name = obj.instanceName;
            (name) ? name = name : name = renderer.anim.drawable[obj.objRef].name;
            let newInp = document.createElement("input");
            newInp.setAttribute("type", "text");
            newInp.setAttribute("value", name);
            newInp.classList.add("my-0", "border-0");
            if(!(i % 2)) {
                newDiv.classList.add("text-black", "bg-light");
                newInp.classList.add("text-black", "bg-light");
            } else {
                newDiv.classList.add("text-white", "bg-dark");
                newInp.classList.add("text-white", "bg-dark");
            }
            newDiv.appendChild(newInp);
            container.appendChild(newDiv);

            newInp.addEventListener("change", function() {
                renderer.anim.frames[renderer.animFrame].onScreen[i].instanceName = newInp.value;
            });
            newDiv.addEventListener("click", function() { dom.getToolByName("Select").ref.selectObject(obj); });
        }
    }

    highlightFrame() {
        for(let j = 0; j < renderer.anim.frames.length; j++) {
            let frameBox = document.getElementById("frame" + j);
            if(j !== renderer.animFrame) {
                frameBox.classList.remove("btn-success");
                frameBox.classList.add("btn-primary");
            } else {
                frameBox.classList.add("btn-success");
                frameBox.classList.remove("btn-primary");
            }
        }
    }

    generateFrameView() {
        var container = document.getElementById("frame-view-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(let i = 0; i < renderer.anim.frames.length; i++) {
            let newFrame = document.createElement("div");
            newFrame.appendChild(document.createTextNode(i));
            newFrame.id = "frame" + i;
            newFrame.classList.add("frame-box", "d-inline-block", "my-1", "mr-1", "btn",  "btn-primary");
            
            newFrame.addEventListener("click", function() {
                renderer.scrubFrames(i - renderer.animFrame);
            });
            container.appendChild(newFrame);
        }

        this.highlightFrame();
    }

    setTitleMarquee() {
        var animTitle = document.getElementById("anim-title");
        animTitle.innerHTML = renderer.anim.animName;
        if(animTitle.scrollWidth > animTitle.clientWidth) animTitle.classList.add("marquee");
        else animTitle.classList.remove("marquee");
    }

    setFillStrokeColor() {
        let fs = document.getElementById("fill-stroke");
        fs.style.background = "radial-gradient(" + Tool.fillColor + " 40%, " + Tool.strokeColor +" 60%)";
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

        // Window Resize
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

            let dLink = document.createElement("a");
            dLink.setAttribute("href", "data:application/json, " + encodeURIComponent(renderer.anim.getSaveString()));
            dLink.setAttribute('download', renderer.anim.animName);

            if(document.createEvent) {
                var event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                dLink.dispatchEvent(event);
            } else dLink.click();
        });

        // Load animation
        document.getElementById("am-load-animation-modal-loadfile-submit").addEventListener("click", function() { dom.loadAnimationFile(); });

        // Save Object
        document.getElementById("am-save-object-modal-save").addEventListener("click", function() {
            let selectTool = dom.getToolByName("Select").ref;
            if(!selectTool.hasObject) return;

            let saveString = renderer.anim.getSaveString(renderer.anim.drawable[selectTool.selectedObject.objRef]);
            let dLink = document.createElement("a");
            dLink.setAttribute("href", "data:application/json, " + saveString);
            dLink.setAttribute('download', document.getElementById("am-save-object-modal-filename").value);

            if(document.createEvent) {
                var event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                dLink.dispatchEvent(event);
            } else dLink.click();
        });

        // Load object
        document.getElementById("am-load-object-modal-loadfile-submit").addEventListener("click", function() { dom.loadObjectFile(); })

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
        document.getElementById("fc-clear-frame").addEventListener("click", function() {
            renderer.anim.clearFrameObjects(renderer.animFrame);
            dom.getToolByName("Select").ref.selectObject(null);
        });
    }

    loadAnimationFile(fileText = null) { // Read an animation file
        if(fileText) {
            let animFile = JSON.parse(fileText);
            renderer.anim = new Anim(animFile)
            this.generateFrameView();
            this.generateObjectViewDrawable();
            this.generateObjectViewFrame();
            return;
        }

        var fileList = document.getElementById("am-load-animation-modal-loadfile").files;
        var fr = new FileReader();
        fr.readAsText(fileList[0]);
        fr.addEventListener("loadend", function() {
            // Replace current animation
            let animFile = JSON.parse(fr.result);
            renderer.anim = new Anim(animFile);
            dom.generateFrameView();
            dom.generateObjectViewDrawable();
            dom.generateObjectViewFrame();
        });
    }

    loadObjectFile() { // Read an object file
        var fileList = document.getElementById("am-load-object-modal-loadfile").files;
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