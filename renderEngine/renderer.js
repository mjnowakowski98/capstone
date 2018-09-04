// Ironically, none of the drawing occurs in this class :P
class Renderer {
    constructor() {
        this.m_anim = null; // Create a blank animation

        // Playback controller
        this.m_playbackMode = false;
        this.m_fps = 0; // FPS to use in playback mode
        this.m_fpsInterval = 0; // Milliseconds needed to render
        this.m_then; // Set time last frame rendered
        this.m_elapsed; // Time since last frame

        this.m_animFrame = 0; // Current animation frame
        this.m_animFramePrePlay = 0;

        this.m_updateRequest = null; // rAF frameRequest

        this.m_shadowShape = null; // Shape for drawing active tool
        this.m_shadowShapePos = new Coord(0, 0); // Shadow shape start pos
    }

    // Accessors/Mutators
    // Working animation
    get anim() { return this.m_anim; }
    set anim(newAnim) {
        // Set new anim and update fps
        this.m_anim = newAnim;
        this.m_animFrame = 0;
        this.m_fps = this.anim.framesPerSecond;
        this.m_fpsInterval = 1000 / this.m_fps;
    }

    // Playback mode
    get playbackMode() { return this.m_playbackMode; }
    set playbackMode(newMode) {
        this.m_playbackMode = newMode;
        if(this.playbackMode === true) {// Set then to start of playback
            this.m_then = performance.now();
            this.m_animFramePrePlay = this.animFrame;
        } else this.m_animFrame = this.m_animFramePrePlay;
    }

    // Playback FPS
    get framesPerSecond() { return this.m_fps; }
    set framesPerSecond(newFps) {
        if(newFps > 0) { // No negative framerates
            this.m_fps = newFps;
            this.m_fpsInterval = 1000 / this.framesPerSecond;
        }
    }

    get animFrame() { return this.m_animFrame; }

    get shadowShape() { return this.m_shadowShape; }
    set shadowShape(shape) { this.m_shadowShape = shape; }
    get shadowShapePos() { return this.m_shadowShapePos; }
    set shadowShapePos(position) { this.m_shadowShapePos = position; }

    scrubFrames(speed) {
        if(this.animFrame + speed >= 0) {
            if(this.animFrame + speed < this.anim.numFrames) this.m_animFrame += speed;
            else this.m_animFrame = 0;
        } else this.m_animFrame = this.anim.numFrames - 1;
    }

    // Because rAF doesn't like method callbacks
    // Render a frame
    static render() {
        // Throttle framerate during playback
        if(renderer.playbackMode) {
            // Update time/elapsed at frame
            var newTime = performance.now();
            renderer.m_elapsed = newTime - renderer.m_then;

            // Check if interval passed
            if(renderer.m_elapsed > renderer.m_fpsInterval) {
                renderer.m_then = newTime - (renderer.m_elapsed % renderer.m_fpsInterval);
                renderer.scrubFrames(1); // Advance frame
            }
        }

        renderer.anim.renderFrame(renderer.animFrame); // Render current anim frame

        if(!renderer.playbackMode)
            dispatchEvent(Renderer.frameEvent); // Let editor parts know window is framing

        renderer.m_updateRequest = requestAnimationFrame(Renderer.render); // Request a new frame
    }

    static getInstance() {
        if(!Renderer.uniqueInstance) Renderer.uniqueInstance = new Renderer();
        return Renderer.uniqueInstance;
    }
}

Renderer.frameEvent = new Event("frame");
Renderer.uniqueInstance = null;