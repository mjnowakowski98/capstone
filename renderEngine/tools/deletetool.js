class DeleteTool extends Tool {
    constructor() {
        super();
        this.m_toolName = "Delete";
    }

    onToolReady() {
        var selectTool = dom.getToolByName("Select").ref;
        if(selectTool.hasObject) {
            var i = renderer.anim.frames[renderer.animFrame].onScreen.indexOf(selectTool.selectedObject);
            renderer.anim.frames[renderer.animFrame].onScreen.splice(i, 1);
            selectTool.selectObject(null);
        }
        dom.generateObjectViewFrame();
        dom.currentTool = "none";
    }

    onToolCancel() {
        this.toolStateString = "toolWaiting";
    }
}