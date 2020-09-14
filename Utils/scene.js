/**
 * @description principal class for the scene rendering
 * 
 */
class Scene {

    /**
     * @constructor
     * @param {Object} param0 setup for the scene
     * 
     */
    constructor({canvas, width, height, backgroundColor, controls, backgroundImage}) {
        this.canvas = canvas;
        try {
            this.getContext = () => this.canvas.getContext("2d");;
        } catch(error) {
            throw new Error("Failed to initialize canvas: " + error.message);
        }
        this.width = width || 300;
        this.height = height || 300;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // controls binded directly to the scene
        this.controls = controls || [];
        this.joystick = null;
        this.swipe = null;

        this.controls.forEach((c, i) => {
            if(c.event === "swipe") {
                this.swipe = new Swipe({element:this.canvas, type:c.type});
            } else if(c.event === "joystick") {
                this.joystick = new JoyStick({canvas:this.canvas, ...c.style});
            }
        });
        
        // set default backgroundColor
        if(backgroundColor !== undefined)
            this.canvas.style.backgroundColor = backgroundColor;

        if(backgroundImage !== undefined) {
            this.canvas.style.backgroundImage = `url(${backgroundImage})`;
            this.canvas.backgroundSize = "cover";
        }

        // animations
        this.startLoop = callback => requestAnimationFrame(callback);
        this.elapsedTime = 0;   // elapsed time till the scene is active
        this.animationFrame = null;

        // fps
        this.timeEnded = null;
        this.timeStarted = null;
        this.fps = null;

        Scene.setScene(this);
        Scene.setContext(this.canvas);
    }

    /**
     * @description calculate fps for the current scene
     * 
     */
    calcFps() {
        this.timeEnded = performance.now();
        this.fps = 1000 / (this.timeEnded - this.timeStarted);
        this.timeStarted = this.timeEnded;
    }

    /**
     * @description start the main animation's loop
     * @param {Function} callback function's to be updated
     * 
     */
    mainLoop(callback) {
        const animate = elapsedTime => {
            this.elapsedTime = elapsedTime;
            this.animationFrame = animate;
            callback();
           
        }
        this.startLoop(animate);
    }

    /**
     * @description set the current 2D rendering context to an instacen of canvas
     * @param {HTMLCanvasElement} canvas a reference to the canvas
     * 
     */
    static setContext(canvas) {
        try {
            CURRENT_CONTEXT = canvas.getContext("2d");
        } catch (err) {
            throw new Error(`Failed to set the global variable "CURRENT_CONTEXT": ${err.message}`);
        }
    }


    static setScene(scene) {
        if(scene instanceof Scene)
            CURRENT_SCENE = scene;
        else throw TypeError(`"${scene}" must be an instance of Scene`);
    }
}
