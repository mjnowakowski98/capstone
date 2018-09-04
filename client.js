// Global accessors
var renderer;
var dom;

// On DOM ready
addEventListener("load", function() {
    dom = DOM.getInstance(); // Get singleton instance on DOM class
    renderer = Renderer.getInstance(); // Get singleton instance on Renderer class
    renderer.anim = new Anim();

    dom.initListeners(); // Initialize DOM event listeners
    dom.generateFrameView();
    dom.generateObjectViewDrawable();

    Renderer.render(renderer); // Start rendering loop
});