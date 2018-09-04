class DOM {
    constructor() {
        // Register initial tools
        this.m_tools = [
            {
                "name":"none",
                "ref":new Tool(),
                "element":null
            },
            {
                "name":"selectTool",
                "ref":new SelectTool(),
                "element":document.getElementById("tool-select")
            },
            {
                "name":"rectangleTool",
                "ref":new RectangleTool(),
                "element":document.getElementById("tool-rectangle")
            },
            {
                "name":"circleTool",
                "ref":new CircleTool(),
                "element":document.getElementById("tool-circle")
            },
            {
                "name":"pathTool",
                "ref":new PathTool(),
                "element":document.getElementById("tool-path")
            }            
        ];

        this.currentTool = "none"; // Tool controller
    }

    // Accessor/Mutator for tool controller
    get currentTool() { return this.m_currentTool; }
    set currentTool(toolName) {
        if(this.currentTool) // Tell current tool it can't finish
            this.currentTool.toolStateString = "toolCancel";

        // Match passed in toolname to known tools
        var foundTool = false;
        for(var i in this.m_tools) {
            if(this.m_tools[i].name === toolName) {
                this.m_currentTool = this.m_tools[i];
                foundTool = true;
            }
        }
        // Check if found
        if(!foundTool) console.error("Cannot set currentTool: " + toolName);
        else this.currentTool.ref.toolStateString = "toolReady"; // Tell tool it's selected
    }

    getToolByName(name) {
        for(var i in this.m_tools) {
            if(this.m_tools[i].name === name)
                return this.m_tools[i];
        }
        return null;
    }

    /*updateUI() {
        var animTitle = document.getElementById("anim-title");
        animTitle.innerHTML = renderer.anim.animName;
        if(animTitle.scrollWidth > animTitle.clientWidth) animTitle.classList.add("marquee");
        else animTitle.classList.remove("marquee");

        
    }*/

    generateObjectViewDrawable() {
        var container = document.getElementById("object-list-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(var i in renderer.anim.drawable) {
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
        }
    }

    generateObjectViewFrame() {
        var container = document.getElementById("object-list-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(var i in renderer.anim.frames[renderer.animFrame].onScreen) {
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

            newDiv.addEventListener("click", function() { this.getToolByName("selectTool").ref.selectObject(obj); });
        }
    }

    generateFrameView() {
        var container = document.getElementById("frame-view-container");
        while(container.firstChild) container.removeChild(container.firstChild);

        for(let i in renderer.anim.frames) {
            let newFrame = document.createElement("div");
            newFrame.id = "frame" + i;
            newFrame.classList.add("frame-box", "d-inline-block", "bg-light", "my-1", "mr-1", "btn",  "btn-outline-primary");
            newFrame.addEventListener("click", function() { renderer.scrubFrames(i - renderer.animFrame); });
            container.appendChild(newFrame);
        }
    }

    initListeners() { // Initialize event listeners for DOM actions
        for(var i = 0; i < this.m_tools.length; i++) {
            let toolName = this.m_tools[i].name;
            let elem = this.m_tools[i].element;
            if(elem) elem.addEventListener("click", function() {
                dom.currentTool = toolName;
                dom.currentTool.toolStateString = "toolReady";
            });
        }

        addEventListener("frame", function() { dom.currentTool.ref.onFrame(); });

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