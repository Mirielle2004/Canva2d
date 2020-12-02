/**
* @TODO
* - Add a better animation's pause state
*
* FUNCTIONS
* -onLoading, onReady, update, addEventListener
*/

export class Scene {
    /**
    * @constructor
    * @param {Number} w width of the scene
    * @param {Number} h height of the scene
    * @param {Boolean} dynamic should the scene requestAnimationFrame ? 
    */
    constructor(w, h, dynamic=false) {
        this._canvas = document.createElement('canvas');
        this._canvas.width = w;
        this._canvas.height = h;
        this._ctx = this._canvas.getContext("2d");
        
        this._isDynamic = dynamic;
        this._animationId = null;
        
        // functions
        this.clear = () => this._ctx.clearRect(0, 0, w, h);
        this.update = null;
        
        this._canvas.class = "batCanvasScene";
        document.body.appendChild(this._canvas);
    }
    
    /**
    * @method getScene
    * @description get the canvas of this scene
    * @return {HTMLCanvasElement} the canvas of this scene
    */
    getScene() {
        return this._canvas;
    }
    
    /**
    * @method getContext
    * @description get the drawing context for the canvas of this scene
    * @return {CanvasRenderingContext2D} the drawing context for this scene
    */
    getContext() {
        return this._canvas.getContext("2d");
    }
    
    /**
    * EXPERIMENTAL
    * @method pause
    * @description pause a dynamic scene 
    */
    pause() {
        this.state = "paused";
        cancelAnimationFrame(this._animationId);
    }
    
    setWidth(w) {
        this.getScene().width = w;
    }
    
    setHeight(h) {
        this.getScene().height = h;
    }

    /**
    * @method getWidth
    * @description get the width of this scene
    * @return {Number} the width for this scene
    */
    getWidth() {
        return this._canvas.width;
    }

    /**
    * @method getHeight
    * @description get the height of this scene
    * @return {Number} the height of this scene
    */
    getHeight() {
        return this._canvas.height;
    }
    
    /**
    * @method css
    * @description style this css width css using key-value syntax of the javascript object
    * @param {Object} styles styling data for this scene
    * styles = {backgroundColor, color};
    */
    css(styles) {
        this.getScene().css(styles);
    }
    
    /**
    * @method attr
    * @description give an attribute to this scene
    * attr = {id, class}
    */
    attr(att) {
        this.getScene().attr(att);
    }

    /**
    * @method getFPS
    * @description calculate the current fps for the scene
    * @return {Number} the fps
    */
    getFPS() {
        let t1 = performance.now();
        let fps = 1000 / (t1 - this._fpsStarted);
        this._fpsStarted = t1;
        return fps;
    }


    /**
    * @method getElapsedTimePS
    * @description elased time per seconds
    * @return {Number} total elapsed time in seconds
    */
    getElapsedTimePS() {
        return (this.currentTime - this._timeStarted) * .001;
    }
    
    /**
    * @method getFelapsedTimePS
    * @description elapsed time for every frame in seconds
    * @return {Number} fElapsedTime per seconds
    */
    getFelapsedTimePS() {
        let eTime = 0.001 * (this.currentTime - this._frameElapsedTimeStarted);
        this._frameElapsedTimeStarted = this.currentTime;
        // stop updating when tab switched
        if(eTime > 0.2) eTime = 0;
        return eTime;
    }
    
    animate() {
        const animate = currentTime => {
            this.clear();
            this.currentTime = new Date().getTime();
            this.update();
            this._animationId = requestAnimationFrame(animate);
        };
        return animate;
    }
    
    /**
    * @method start
    * @description start the scene
    */
    start() {
        if(this._isDynamic) {
            this._elapsedTimeStarted = new Date().getTime();
            this._fpsStarted = performance.now();
            requestAnimationFrame(this.animate());            
        } else this.update();
        
    }
    
    
    addEventListener(type, callback, capture=false) {
        this.getScene().addEventListener(type, callback, capture);
    }
}