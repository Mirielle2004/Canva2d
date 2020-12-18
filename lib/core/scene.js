;{

    /**
     * @function Scene
     * @description creates a scene page
     * @param {Number} width width of the canvas
     * @param {Number} height height of the canvas
     * @param {Boolean} dynamic wether the canvas should update animation's 
     * frame or not
     */
    const Scene = (function(width, height, dynamic=false) { 

        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);

        let fps_timeStarted = performance.now();
        let timeStarted = new Date().getTime();
        let frameElapsedTimeStarted = new Date().getTime();
        let totalElapsedTimeStarted = new Date().getTime();

        let animationId;

        class Scene {
            /**
            * @constructor
            * @param {Number} width width of the scene
            * @param {Number} height height of the scene
            * @param {Boolean} dynamic should the scene requestAnimationFrame ? 
            */
            constructor(width, height, dynamic) {
                this._isDynamic = dynamic;
                this.update = null;
            }
            
            /**
            * @method getScene
            * @description get the canvas of this scene
            * @return {HTMLCanvasElement} the canvas of this scene
            */
            getScene() {
                return canvas;
            }
            
            /**
            * @method getContext
            * @description get the drawing context for the canvas of this scene
            * @param {String} contextType type of the canvas context
            * @return {CanvasRenderingContext2D} the drawing context for this scene
            */
            getContext(contextType) {
                return this.getScene().getContext(contextType);
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
                return this.getScene().width;
            }
        
            /**
            * @method getHeight
            * @description get the height of this scene
            * @return {Number} the height of this scene
            */
            getHeight() {
                return this.getScene().height;
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
                let fps = 1000 / (t1 - fps_timeStarted);
                fps_timeStarted = t1;
                return fps;
            }
        
        
            /**
            * @method getElapsedTimePS
            * @description elased time per seconds
            * @return {Number} total elapsed time in seconds
            */
            getTotalElapsedTimePS() {
                return (this.currentTime - totalElapsedTimeStarted) * .001;
            }
            
            /**
            * @method getFelapsedTimePS
            * @description elapsed time for every frame in seconds
            * @return {Number} fElapsedTime per seconds
            */
            getFelapsedTimePS() {
                let eTime = 0.001 * (this.currentTime - frameElapsedTimeStarted);
                frameElapsedTimeStarted = this.currentTime;
                // stop updating when tab switched
                if(eTime > 0.2) eTime = 0;
                return eTime;
            }
            
            animate() {
                const animate = currentTime => {
                    this.currentTime = new Date().getTime();
                    this.update();
                    animationId = requestAnimationFrame(animate);
                };
                return animate;
            }
            
            /**
            * @method start
            * @description start the scene
            */
            play() {
                if(this._isDynamic) {
                    fps_timeStarted = performance.now();
                    totalElapsedTimeStarted = new Date().getTime();
                    frameElapsedTimeStarted = new Date().getTime();
                    requestAnimationFrame(this.animate());            
                } else this.update();
                
            }

            pause() {
                cancelAnimationFrame(animationId);
            }
            
            addEventListener(type, callback, capture=false) {
                this.getScene().addEventListener(type, callback, capture);
            }
        }

        return new Scene(width, height, dynamic);
    });

    Object.defineProperty(Canva2D.API, "Scene", {value:Scene});

};