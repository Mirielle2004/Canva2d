/**
 * @description Pricipal class that manipulates the canvas elements. The Scene
 * defines the properties for the viewport of the graphics
 */
class Scene {
    /**
     * @constructor
     * @param {Object} arg keyword arguement for the scene
     * 
     */
    constructor(arg) {
        this.canvas = arg.canvas || null;
        try {
            this.ctx = this.canvas.getContext("2d");
        } catch(error) {
            throw new Error("Failed to initialize canvas: " + error.message);
        }
        this.width = arg.width || 300;
        this.height = arg.height || 300;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // controls binded directly to the scene
        this.controls = arg.controls || [];
        this.joystick = null;
        this.swipe = null;

        this.controls.forEach((c, i) => {
            if(c.event === "swipe") {
                this.swipe = new SwipeControl(this.canvas, c.type);
            } else if(c.event === "joystick") {
                this.joystick = new Joystick(this.canvas, c.style);
            }
        });
        
        // set default backgroundColor
        if(arg.backgroundColor !== undefined)
            this.canvas.style.backgroundColor = arg.backgroundColor;

        this.startLoop = callback => requestAnimationFrame(callback);
        this.elapsedTime = 0;   // frames per second
        this.animationFrame = null;

        // fps
        this.timeEnded = null;
        this.timeStarted = null;
        this.fps = null;

        Scene.setContext(this.canvas);
    }

    calcFps() {
        this.timeEnded = performance.now();
        this.fps = 1000 / (this.timeEnded - this.timeStarted);
        this.timeStarted = this.timeEnded;
    }

    // 
    mainLoop(callback) {
        const animate = elapsedTime => {
            this.elapsedTime = elapsedTime;
            this.animationFrame = animate;
            callback();
           
        }
        this.startLoop(animate);
    }


    static setContext(canvas) {
        try {
            CURRENT_CONTEXT = canvas.getContext("2d");
        } catch (err) {
            throw new Error(`Failed to set the global variabl "CURRENT_CONTEXT": ${err.message}`);
        }
    }
}
