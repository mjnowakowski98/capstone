class Tool {
    constructor() {
        this.listeners = {};

        this.m_states = [
            "toolWaiting",
            "toolReady",
            "toolActive",
            "toolEnding",
            "toolCancel"
        ];
        this.m_currentState = 0;
        this.m_currentStateString = this.m_states[this.m_currentState];

        this.m_toolName = "none";

        this.addEventListener("toolstatechange", this.onToolStateChange);
        this.addEventListener("toolwaiting", this.onToolWaiting);
        this.addEventListener("toolready", this.onToolReady);
        this.addEventListener("toolactive", this.onToolActive);
        this.addEventListener("toolending", this.onToolEnding);
        this.addEventListener("toolcancel", this.onToolCancel);
    }

    addEventListener(type, callback) {
        if(!(type in this.listeners))
            this.listeners[type] = [];
        this.listeners[type].push(callback);
    }

    removeEventLister(type, callback) {
        if(!type in this.listeners) return;
        var stack = this.listener[type];
        for(var i = 0, l = stack.length; i < l; i++) {
            if(stack[i] === callback) {
                stack.splice(i,1);
                return;
            }
        }
    }

    dispatchEvent(event) {
        if(!(event.type in this.listeners)) return true;
        var stack = this.listeners[event.type].slice();
        for(var i = 0, l = stack.length; i < l; i++)
            stack[i].call(this, event);

        return !event.defaultPrevented;
    }

    static get fillColor() { return Tool.s_fillColor; }
    static set fillColor(newFill) {
        Tool.s_fillColor = newFill;
        
    }

    get toolState() { return this.m_currentState; }
    get toolStateString() { return this.m_currentStateString; }
    set toolStateString(newState) {
        var stateNdx = this.m_states.indexOf(newState);
        if(stateNdx != -1) {
            this.m_currentStateString = newState;
            this.m_currentState = stateNdx;
            this.dispatchEvent(Tool.stateChangeEvent);
        } else console.error("Attempt to set invalid state'" + newState + "' on " + this.toolName);
    }

    get name() { return this.m_toolName; }

    onToolStateChange() {
        switch(this.toolStateString) {
            case "toolWaiting":
                this.dispatchEvent(Tool.onWaitingEvent);
                break;
            case "toolReady":
                this.dispatchEvent(Tool.onReadyEvent);
                break;
            case "toolActive":
                this.dispatchEvent(Tool.onActiveEvent);
                break;
            case "toolEnding":
                this.dispatchEvent(Tool.onEndingEvent);
                break;
            case "toolCancel":
                this.dispatchEvent(Tool.onCancelEvent);
                break;
            default:
                console.error("Invalid tool state: " + this.toolStateString);
                break;
        }
    }

    onToolWaiting() {}
    onToolReady() {}
    onToolActive() {}
    onToolEnding() {}
    onToolCancel() {}

    handleCanvasClick() {}
    handleCanvasMouseDown() {}
    handleCanvasMouseUp() {}

    onFrame() {}
}

Tool.s_fillColor = "#000000";
Tool.strokeColor = "#FFFFFF";
Tool.useFill = true;
Tool.useStroke = false;
Tool.strokeWidth = 1;

Tool.stateChangeEvent = new Event("toolstatechange");
Tool.onWaitingEvent = new Event("toolwaiting");
Tool.onReadyEvent = new Event("toolready");
Tool.onActiveEvent = new Event("toolactive");
Tool.onEndingEvent = new Event("toolending");
Tool.onCancelEvent = new Event("toolcancel");