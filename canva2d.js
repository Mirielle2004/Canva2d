/**
 * 
 * @author Mirielle S.
 * @name: Canva2D.js
 * @description A simple HTML5 Canvas game Engine
 * Last Revision: 4th Dec. 2020
 * 
 * 
 * MIT License 
 * Copyright (c) 2020 CodeBreaker
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * for /r "c:\javascripts" %F in (*.js) do @type "%F" >>canva2d.js
 * code --disble-gpu
 */
class ShapeComponent {

	constructor(type, pos, dimension) {
		this.validTypes = [
			"rect", 
			"circle",
			"line",
			"polygon"
		];
		if(!(this.validTypes.some(i => i === type)))
			throw TypeError(`Failed to create Component, valid type 
				must be from ${this.validTypes}`);
		this.type = type;

		if(this.type === "rect") {
			this.pos = Vector2.createFrom(pos);
			this.dimension = Vector2.createFrom(dimension);
		} 
		else if(this.type === "circle") {
			this.pos = Vector2.createFrom(pos);
			this.r = dimension;
		} 
		else if(this.type === "line") {
			this.start = Vector2.createFrom(pos);
			this.end = Vector2.createFrom(dimension);
		} 
		else if(this.type === "polygon") {
			this.pos = Vector2.createFrom(pos);
			this.vertices = [];
			if(dimension instanceof Array) {
				if(dimension[0][0] !== undefined) {
					dimension.forEach(data => {
						this.vertices.push(Vector2.createFrom(data));
					});
				}
			}
		}
		
	}


}const Component = {

    Shape: function(type, pos, dimension) {
        return new ShapeComponent(type, pos, dimension);
    },

    Basic: function(type, pos, dimension) {
        return new ShapeComponent(type, pos, dimension);
    },
    
    Sprite: function(frames, col, delay=5) {
        return new SpriteComponent(frames, col, delay);
    },
    
    Tile: function(pos, dimension) {
        return new TileComponent(pos, dimension);
    }

};class SpriteComponent {
        /**
         * @constructor
         * @param {Object} frames object contain animation frames data array
         * @param {Number} col number of columns in the spritesheet
         * @param {Number} delay animation delay
        */
        constructor(frames, col, delay=5) {
            this.col = col;
            this.frames = frames;
            this.currentFrames = [];
            this.frameName = null;
            for(const i in this.frames) {
                this.setFrame(i);
                break;
            }
            this.delay = delay;
            this.index = new Vector2();
            this._delayCounter = 0;
            this._frameCounter = 0;
            this.done = false;
            this.paused = false;
        }

        /**
         * @method setFrame
         * @description sets the current animation's frame
         * @param {String} frameName animation's frame name
         */
        setFrame(frameName) {
            if(this.frames.hasOwnProperty(frameName)) {
                if(this.frames[frameName] instanceof Array) {
                    this.currentFrames = this.frames[frameName];
                    this.frameName = frameName;
                } else 
                    throw TypeError("Sprite's current frame must be an instance of an Array");
            }
            else 
                throw new Error(`Sprite Frame name does not exists`);
        }
    
        /**
         * @method getTextureIndex
         * @description gets the source vectors for the animation. This 
         * method must be called in a loop for an effective animation
         */
        getTextureIndex() {
            if(!this.paused) {
                this._delayCounter++;
                if(this._delayCounter > this.delay) {
                    this._delayCounter = 0;
                    this._frameCounter++;
                    if(this._frameCounter >= this.currentFrames.length) {
                        this.done = false;
                        this._frameCounter = 0;
                    } else {
                        this.done = true;
                    }
                    let value = this.currentFrames[this._frameCounter] - 1;
                    let x = value % this.col;
                    let y = value / this.col;
                    this.index = new Vector2(~~x, ~~y);
                }    
            } else {
                let value = this.currentFrames[0];
                this.index = new Vector2(~~(value % this.col), ~~(value / this.col));
            }
        }
}class TileComponent {
    
    constructor(pos, dimension) {
        this.pos = Vector2.createFrom(pos);
        this.dimension = Vector2.createFrom(dimension);
        
        this._cBoundary = {
            pos: {x:0, y:0},
            dimension: this.dimension
        };
        
        this.lastPos = null;
        this.nextPos = null;
        this.currentPos = null;
        
        this._minPos = null;
        this._maxPos = null;
    }
    
    checkCollision(map, velocity, {left=null, top=null}) {
        // X-axis
        this.lastPos = this.pos;
        this.nextPos = Vector2.createFrom({
            x: this.lastPos.x + velocity.x,
            y: this.lastPos.y 
        });
        
        this._minPos = this.nextPos.mult(map.size.inverse()).applyFunc(Math.floor);
        this._maxPos = this.nextPos.add(this._cBoundary.dimension).mult(map.size.inverse()).applyFunc(Math.ceil);
        
        for(let r=this._minPos.y; r < this._maxPos.y; r++) {
            for(let c=this._minPos.x; c < this._maxPos.x; c++) {
                this.currentPos = map.getId([c, r]);
                if(typeof left === "function") left();
            }   
        }
        
        this.pos.x = this.nextPos.x;
        
        // Y-axis
        this.lastPos = this.pos;
        this.nextPos = Vector2.createFrom({
            x: this.lastPos.x,
            y: this.lastPos.y + velocity.y 
        });
        
        this._minPos = this.nextPos.mult(map.size.inverse()).applyFunc(Math.floor);
        this._maxPos = this.nextPos.add(this._cBoundary.dimension).mult(map.size.inverse()).applyFunc(Math.ceil);
        
        for(let r=this._minPos.y; r < this._maxPos.y; r++) {
            for(let c=this._minPos.x; c < this._maxPos.x; c++) {
                this.currentPos = map.getId([c, r]);
                if(typeof top === "function") top();
            }   
        }
        
        this.pos.y = this.nextPos.y;
        
    }
    
}const JoyStick = (function() {

    class JoyStick {
        constructor() {
            this.pos = [0, 0]
        }
    };

    return new JoyStick();

});const Swipe = (function(element, type, single) {

    function getSwipeDirection(v1, v2) {
        let diffPos = {
            x: v2.x - v1.x,
            y: v2.y - v1.y
        };
        let dir = "";
        if(Math.abs(diffPos.x) > Math.abs(diffPos.y)) {
            if(diffPos.x > 0) 
                return [diffPos, "right"]
            return [diffPos, "left"]
        } else {
            if(diffPos.y > 0)
                return [diffPos, "down"]
            else return [diffPos, "up"]
        };
    };


    // function to handler swipe with touch
    function multiTouch(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("touchstart", e => {
            
        });
        
        ele.addEventListener("touchmove", e => {
            
        });
        
        ele.addEventListener("touchend", e => {
            
        });
    };

    // function that handles single touch events
    function singleTouch(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("touchstart", e => {
            el.data.origin = {x: e.touches[0].pageX, y: e.touches[0].pageY};
            el.data.isActve = true;
            if(typeof el.onSwipeStart === "function") el.onSwipeStart();
        });
        
        ele.addEventListener("touchmove", e => {
            let getDiffDir = getSwipeDirection(el.data.origin, {x: e.touches[0].pageX, y:e.touches[0].pageY});
            let newData = {
                mouse: e,
                currentPos: {x:e.touches[0].pageX, y:e.touches[0].pageY},
                diffPos: getDiffDir[0],
                direction: getDiffDir[1],
                angle: Math.atan2(getDiffDir[0].y, getDiffDir[0].x)
            };
            Object.assign(el.data, newData);
            if(typeof el.onSwipeMove === "function")
                el.onSwipeMove();
        e.preventDefault();
        }, {passive:false});
        
        ele.addEventListener("touchend", e => {
        el.data = {
            origin: {x: 0, y: 0},

            isActive: false,
            direction: null,
        };
            if(typeof el.onSwipeEnd === "function") el.onSwipeEnd();
        });
    };


    // function to handle mouse swipe
    function mouse(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("mousedown", e => {
            el.data.origin = {x: e.clientX, y: e.clientY};
            el.data.isActve = true;
            if(typeof el.onSwipeStart === "function") el.onSwipeStart();
        });
        
        ele.addEventListener("mousemove", e => {
            if(el.data.isActve) {
                let getDiffDir = getSwipeDirection(el.data.origin, {x: e.clientX, y:e.clientY});
                let newData = {
                    mouse: e,
                    currentPos: {x:e.clientX, y:e.clientY},
                    diffPos: getDiffDir[0],
                    direction: getDiffDir[1],
                    angle: Math.atan2(getDiffDir[0].y, getDiffDir[0].x)
                }
                el.data = newData;
                if(typeof el.onSwipeMove === "function") el.onSwipeMove();
            }
        });
        
        ele.addEventListener("mouseup", e => {
        el.data = {
            origin: {x: null, y: null},
            currentPos: {x:e.clientX, y:e.clientY},
            isActive: false,
            direction: null,
        };
            if(typeof el.onSwipeEnd === "function") el.onSwipeEnd();
        });
    };


    function Swipe(element, type, single) {
        this.element = element || null;
        this.single = single;
        // functions
        this.data = {};
        this.onStart = null;
        this.onMove = null;
        this.onEnd = null;
        
        if(type === "default") {
            mouse(this);
            if(this.single) singleTouch(this);
            else multiTouch(this);
        } else if(type === "touch") {
            if(single) singleTouch(this);
            else multiTouch(this);
        } else if(type === "mouse") {
            mouse(this);
        }        
    }

    return new Swipe(element, type, single);

});window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000/60);
    }
})();


// HTML Element
Object.defineProperties(HTMLElement.prototype, {
   
    css: {
		value: function(styles) {
			if(!styles instanceof Object) 
				throw new Error(`CSS Styling data must be an instanceof an Object`)
			let res = "";
			for(const key in styles) {
				this.style[key] = styles[key];
			}
		},
        configurable: true
	},

	attr: {
		value: function(attrs) {
			if(!attrs instanceof Object) 
				throw new Error(`ATTR data must be an instanceof an Object`)
			for(const key in attrs) {
				this[key] = attrs[key];
			}
		},
        configurable: true
	}
    
});


// Math Object
Object.defineProperties(Math, {

	degToRad: {
		value:function(number) {
			return number * this.PI / 180;
		},
        configurable: true,
	},

	radToDeg: {
		value: function(number) {
			return number * 180 / this.PI;
		},
        configurable: true,
	},

	isEven: {
		value: function(number) {
			return !(number & 1)
		},
        configurable: true,
	},

	randRange: {
		value: function(min, max) {
			return this.random() * (max - min + 1) + min;
		},
        configurable: true,
	},

	clamp: {
		value: function(min, max, val) {
			return this.min(this.max(min, +val), max);
		},
        configurable: true,
	}
    
});


// utility functions
const Utils = {
    $(id) {
        return document.querySelector(id);
    },
    
    $all(id) {
        return document.querySelectorAll(id);
    },
    
    randFromArray(array) {
        return array[~~(Math.random() * array.length)];
    }
};const Launcher = function(config) {
    
    let element = config.element === undefined ?document.createElement("CANVAS") : config.element;
    if(config.element === undefined) {
        element.width = config.width || 300;
        element.height = config.height || 300;
        element.style.backgroundColor = config.theme === "dark" ? "#222" : "#fff";
    };
    element.id = "launcher";
    element.style.position = "absolute";
    element.style.zIndex = "2000";
    document.body.insertBefore(element, document.body.childNodes[0]);
    
    let fontSize = config.fontSize || 35;
    let fontFamily = config.fontFamily || "Verdana";
    
    if(config.element === undefined) {
        let ctx = element.getContext("2d");
        // draw logo
        ctx.beginPath();
        ctx.moveTo(config.width/2, config.height/2 - 20);
        for(let i=0; i <= 360; i+=60) {
            let angle = i * Math.PI / 180;
            let radius = fontSize * 3;
            let x = config.width/2 + Math.cos(angle) * radius;
            let y = (config.height/2 - 20) + Math.sin(angle) * radius;
            ctx.lineTo(x, y);
        }
        ctx.fillStyle = config.theme === "dark" ? "#333" : "dimgray";
        ctx.fill();            
        // bat text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = config.theme === "dark" ? "dimgray" : "#fff";
        ctx.fillText("Bat Games", config.width/2, config.height/2 - 20);
        // bat description
        ctx.font = `bold ${fontSize - (fontSize-10)}px ${fontFamily}`;
        ctx.fillStyle = "red";
        ctx.fillText("Games API for web developers", config.width/2, config.height/2 + 20);
        // copyright
        ctx.font = `bold 10px ${fontFamily}`;
        ctx.fillStyle = config.theme === "dark" ? "#fff" : "#222";
        ctx.fillText("Mirielle "+new Date().getFullYear(), config.width/2, config.height - 50);
    }
    
    
    return new Promise(resolve => {
        setTimeout(() => {
            document.body.removeChild(element);
            resolve({status:"Loaded"});
        }, config.timeOut || 5000);
    });
};/**
* @class Preloader
* Principal class for preloading objects
*/
class Preloader {
    
    /**
    * @static loadImage
    * @description load a single image
    * @params {Image} img image to be preloaded
    * @params {String} str source of the image
    * @returns {Promise} the promise state of the image
    */
    static loadImage(img, src="") {
        return new Promise((resolve, reject) => {
            img.onload = () => {
                resolve({img:img, status:"loaded", src:img.src});
            };
            img.onerror = () => {
              reject({status:"failed", message:`failed to load ${img.src}`});
            };
            if(img.src !== "") img.src = img.src;
            else img.src = src;
        });
    }
    
    /**
    * @static loadImages
    * @description load multiple single images
    * @params {Array} imgData containing data of the images to be preloaded.
    * imgData = [{img, src}]
    * @returns {Promise} the promise state of all the images
    */
    static loadImages(imgData){
        let res = [];
        imgData.forEach(data => {
           let preloader = Preloader.loadImage(data.img, data.src);
            res.push(preloader);
        });
        return Promise.all(res);
    }
    
    /**
    * @static loadAudio
    * @description load a single audio object
    * @params {Audio} aud audio to be preloaded
    * @params {String} str source of the audio
    * @returns {Promise} the promise state of the image
    */
    static loadAudio(aud, src="") {
        return new Promise((resolve, reject) => {
            if(aud.src !== "") aud.src = aud.src;
            else aud.src = src;
            aud.load();
            aud.addEventListener("canplaythrough", () => {
                resolve({aud:aud, status:"loaded", src:aud.src});
            });
            aud.onerror = () => {
              reject({status:"failed", message:`failed to load ${aud.src}`});
            };
        });
    }
    
    /**
    * @static loadAudios
    * @description load multiple audio objects
    * @params {Array} audData data of all the audios to be preloaded
    * audData = [{aud, src}]
    * @returns {Promise} the promise state of the audios
    */
    static loadAudios(audData){
        let res = [];
        audData.forEach(data => {
           let preloader = Preloader.loadAudio(data.aud, data.src);
            res.push(preloader);
        });
        return Promise.all(res);
    }
    
    /**
    * @static loadFile
    * @description load a single file remotedly
    * @params {Object} data info of the file
    * data = {src, res}
    * @returns {Promise} the promise state of the file
    */
    static loadFile(data) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if(req.readyState === XMLHttpRequest.DONE) {
                    if(req.status === 200) {
                        data.res = req.responseText;
                        resolve({status:"loaded", src:data.src, ...data});
                    } else 
                        reject({status:"failed", src:data.src, message:"No Internet Connection"});
                }
            };
            req.onerror = () => {
                reject({status:"failed", src:data.src, message:"Something went wrong"});
            }
            req.open("GET", data.src);
            req.send();
        });
    }
    
    /**
    * @static loadFiles
    * @description load a multiple file remotedly
    * @params {Array} fileData info of the files
    * fileData = [{src, res}]
    * @returns {Promise} the promise state of the file
    */
    static loadFiles(fileData){
        let res = [];
        fileData.forEach(data => {
           let preloader = Preloader.loadFile(data);
            res.push(preloader);
        });
        return Promise.all(res);
    }
    
    /**
    * @constructor
    * @params {Array} assets to be loaded
    * assets = [{src, name, type}, {src, name, type, res}]
    **/
    constructor(assets) {
        this._assets = assets;
        this._images = [];
        this._audios = [];
        this._files = [];

        this._assets.forEach(asset => {
            // images
            if(['.jpg', '.png', '.jpeg', '.gif'].some(i => asset.src.endsWith(i)) || asset.type !== undefined && asset.type === "img" || asset.type === "image") {
                let img = {img: asset.img === undefined ? new Image(): asset.img, ...asset}
                this._images.push(img);
            }
            // audio
            if(['.mp3', '.ogg', '.wav'].some(i => asset.src.endsWith(i)) || asset.type !== undefined && asset.type === "aud" || asset.type === "audio") {
                let aud = {aud: asset.aud === undefined ? new Audio(asset.src):asset.aud, ...asset}
                this._audios.push(aud);
            }
            // files
            else if(['.json', '.txt', '.obj'].some(i => asset.src.endsWith(i)) || asset.type !== undefined && asset.type === "other" || asset.type === "file") {
                let file = {file:"", ...asset}
                this._files.push(file);
                
            }
        });
    }
    
    /**
    * @method getMedia
    * @description get a media by name from this preloader
    * @param {String} name of the media
    * @param {String} type of the media
    * @return {Any}
    */
    getMedia(name, type) {
        if(type === "aud" || type === "audio")
            return this._audios.filter(i => i.name === name)[0].aud;
        else if(type === "img" || type === "image")
            return this._images.filter(i => i.name === name)[0].img;
        else if(type === "file" || type === "other")
            return this._files.filter(i => i.name === name)[0].res;
    }
    
    /**
    * @method load
    * @description load all assets
    */
    async load() {  
        let images, audios, files, _this=this;
        const _DEFMSG = {status:"loaded", message:"Empty file to Load"};
        // img
        if(this._images.length !== 0)
            images = await Preloader.loadImages(this._images);
        else images = await Promise.resolve(_DEFMSG);
        // aud
        if(this._audios.length !== 0) 
            audios = await Preloader.loadAudios(this._audios, this._counter);
        else audios = await Promise.resolve(_DEFMSG);
        // files
        if(this._files.length !== 0) 
            files = await Preloader.loadFiles(this._files);
        else files = await Promise.resolve(_DEFMSG);
        let res = {images: this._images, audios: this._audios, files: this._files}
        return await Promise.all([images, audios, files]).then(e => res);
    }
    
};/**
* @TODO
* - Add a better animation's pause state
*
* FUNCTIONS
* -onLoading, onReady, update, addEventListener
*/

class Scene {
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
}/**
* @todo
* add inverse, mult
**/
class Mat3x3 {
    
    /**
    * @static validate
    * @description check if an array is ok for a 3x3 matrix
    */
    static validate(data) {
        let isValid = false;
        if(data instanceof Array) {
            if(data.length === 3) {
                for(let i=data.length-1; i > 0; i--) {
                    if(data[i].length < 3) 
                        throw new Error("Insufficient 3x3 matrice data");
                }
            } else {
                throw new Error("Insufficient 3x3 matrice data");
            }
        } else 
            throw new Error("Matrix must be an instance of Array");
    }

    /**
    * @static getData
    * @description get the data of a matrix
    */
    static getData(arg) {
        if(arg instanceof Mat3x3) 
            return arg.data;
        else if(arg instanceof Array) {
            Mat3x3.validate(arg);
            return arg;
        }
        else 
            throw new Error("getData expects an argument of an Array instance");
    }

    /**
    * @static multiplyVec
    * @description multiply a vector by a matrix
    * @return {Array}
    */
    static multiplyVec(vec, mat) {
        let res = [];
        let tmp = 0;
        let matData = Mat3x3.getData(mat);
        let vecData = vec;
        if(vec instanceof Array && vec.length === 3) 
            vecData = vec;
        else if(vec instanceof Object && vec.hasOwnProperty("x") 
            && vec.hasOwnProperty("y")) {
                vecData = [vec.x, vec.y, 1]
            }
        // multiply vec by row matrices
        for(let r=0; r < matData.length; r++) {
            tmp = 0;
            for(let j=0; j < matData.length; j++) {
                let prod = vecData[j] * matData[j][r];
                tmp += prod;
            }
            res.push(tmp);
        }
        return res;
    };
    
    /**
    * @static rotate
    * @description rotation matrix
    * @return {Mat3x3}
    */
    static rotate(angle) {
        return new Mat3x3([
            [Math.cos(angle), Math.sin(angle), 0],
            [-Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 1]
        ]);
    }

    /**
    * @static empty
    * description creates an empty matrix
    */
    static empty() {
        return new Mat3x3([
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ]);
    }

    /**
     * @constructor
     * @param {Array} data matrix data
     */
    constructor(data) {
        Mat3x3.validate(data);
        this.data = data;
    }

    /**
     * @method add
     * @description addition of matrices
     * @param {Object} arg a matrix
     * @returns {Mat3x3}
     */
    add(arg) {
        let res = [];
        let mat = Mat3x3.getData(arg);
        for(let r=0; r < this.data.length; r++) {
            res.push(new Array(3));
            for(let j=0; j < this.data.length; j++) {
                res[r][j] = this.data[r][j] + mat[r][j];
            }
        }
        return new Mat3x3(res);
    }

    /**
     * @method sub
     * @description subtraction of matrices
     * @param {Object} arg a matrix
     * @returns {Mat3x3}
     */
    sub(arg) {
        let res = [];
        let mat = Mat3x3.getData(arg);
        for(let r=0; r < this.data.length; r++) {
            res.push(new Array(3));
            for(let j=0; j < this.data.length; j++) {
                res[r][j] = this.data[r][j] - mat[r][j];
            }
        }
        return new Mat3x3(res);
    }

    /**
     * @method determinant
     * @description find the determinant of a matrix
     * @returns {Number} the determinant of a matrix
     */
    determinant() {
        let a = this.data[0][0] * (this.data[1][1] * this.data[2][2] - this.data[1][2] * this.data[2][1]);
        let b = this.data[0][1] * (this.data[1][0] * this.data[2][2] - this.data[1][2] * this.data[2][0]);
        let c = this.data[0][2] * (this.data[1][0] * this.data[2][1] - this.data[1][1] * this.data[2][0]);
        return a - b + c;
    }

    /**
     * @method scale
     * @description scalar multiplication
     * @param {Object} arg a matrix
     * @returns {Mat3x3}
     */
    scale(arg) {
        let res = [];
        for(let r=0; r < this.data.length; r++) {
            res.push([]);
            for(let c=0; c < this.data.length; c++) {
                res[r][c] = this.data[r][c] * arg;
            }
        }
        return new Mat3x3(res);
    }

    /**
     * @method transpose
     * @description transpose a n * m matrix to m * n matrix
     * @returns {Mat4x4} the transpose of a matrix
     */
    transpose() {
        return new Mat3x3([
            [this.data[0][0], this.data[1][0], this.data[2][0]],
            [this.data[0][1], this.data[1][1], this.data[2][1]],
            [this.data[0][2], this.data[1][2], this.data[2][2]]
        ]);
    }

}/**
 * @class Mat4x4
 * A 4x4 matrix class, data could be an array or a Mat4x4 object
 * @todo add inverse / multiplication methods, fix trnaspose
 * 
 */
class Mat4x4 {
    /**
     * @static validate
     * @description validate a 4x4 matrix data
     * @throws Error
     * @param {Object} data matrix data
     */
    static validate(data) {
        let isValid = false;
        if(data instanceof Array) {
            if(data.length === 4) {
                for(let i=data.length-1; i > 0; i--) {
                    if(data[i].length < 4) 
                        throw new Error("Insufficient 4x4 matrice data");
                }
            } else {
                throw new Error("Insufficient 4x4 matrice data");
            }
        } else 
            throw new Error("Matrix must be an instance of Array");
    }

    /**
     * @static getData
     * @description get the data for a mat4x4 object
     * @param {Object} arg return a Mat4x4 matrix data
     * @returns {Array} the mat4x4 data
     */
    static getData(arg) {
        if(arg instanceof Mat4x4) 
            return arg.data;
        else if(arg instanceof Array) {
            Mat4x4.validate(arg);
            return arg;
        }
        else 
            throw new Error("getData expects an argument of an Array instance");
    }

    /**
     * @static multiplyVec
     * @description multiply a vector by a matrix
     * @param {Object} vec a column vector 
     * @param {Object} mat a matrix
     * @returns {Array} a column vector
     */
    static multiplyVec(vec, mat) {
        let res = [];
        let tmp = 0;
        let matData = Mat4x4.getData(mat);
        let vecData = vec;
        if(vec instanceof Array && vec.length === 4) 
            vecData = vec;
        else if(vec instanceof Object && vec.hasOwnProperty("x") 
            && vec.hasOwnProperty("y") && vec.hasOwnProperty("z")) {
                vecData = [vec.x, vec.y, vec.z, 1]
            }
        // multiply vec by row matrices
        for(let r=0; r < matData.length; r++) {
            tmp = 0;
            for(let j=0; j < matData.length; j++) {
                let prod = vecData[j] * matData[j][r];
                tmp += prod;
            }
            res.push(tmp);
        }
        // return back to 3d space
        if(res[3] !== 0) {
            for(let i=0; i < res.length - 1; i++) {
                res[i] /= res[3];
            }
        }
        return res;
    };

    /**
     * @static createEmpty
     * @description creates an empty matrix
     * @returns {Mat4x4}
     */
    static createEmpty() {
        return new Mat4x4([
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
        ]);
    }

    /**
     * @static rotateX
     * @description create a roll rotation matrix
     * @param {Number} angle angle to rotate by
     * @returns {Mat4x4}
     */
    static rotateX(angle) {
        return new Mat4x4([
            [1, 0, 0, 0],
            [0, Math.cos(angle), Math.sin(angle), 0],
            [0, -Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 0, 1]
        ]);
    }
    
    /**
     * @static rotateY
     * @description create a yaw rotation matrix
     * @param {Number} angle angle to rotate by
     * @returns {Mat4x4}
     */
    static rotateY(angle) {
        return new Mat4x4([
            [Math.cos(angle), 0, Math.sin(angle), 0],
            [0, 1, 0, 0],
            [-Math.sin(angle), 0, Math.cos(angle), 0],
            [0, 0, 0, 1]
        ]);
    }
    
    /**
     * @static rotateZ
     * @description create a pitch rotation matrix
     * @param {Number} angle angle to rotate by
     * @returns {Mat4x4}
     */
    static rotateZ(angle) {
        return new Mat4x4([
            [Math.cos(angle), Math.sin(angle), 0, 0],
            [-Math.sin(angle), Math.cos(angle), 0, 0],
            [0, 0, 1, 0], [0, 0, 0, 1]
        ]);
    }

    /**
     * @static project3d
     * @description a 3d perspective projection matrix
     * @param {Number} ar aspect ratio
     * @param {Number} fov field of view
     * @param {Number} zNear farthest distance on the Z-axis
     * @param {Number} zFar neareast distance on the Z-axis
     * @returns {Mat4x4} 3d projection matrix
     */
    static project3d(ar, fov, zNear=0.1, zFar=1000) {
        let q = zFar / (zFar - zNear);
        return new Mat4x4([
            [ar * fov, 0, 0, 0],
            [0, fov, 0, 0],
            [0, 0, q, 1],
            [0, 0, -zNear * q, 0]
        ]);
    }

    /**
     * @constructor
     * @param {Array} data The matrix data
     */
    constructor(data) {
        Mat4x4.validate(data);
        this.data = data;
    }

    /**
     * @method add
     * @description add two matrices
     * @param {Object} arg a matrix
     * @returns {Mat4x4}
     */
    add(arg) {
        let res = [];
        let mat = Mat4x4.getData(arg);
        for(let r=0; r < this.data.length; r++) {
            res.push(new Array(4));
            for(let j=0; j < this.data.length; j++) {
                res[r][j] = this.data[r][j] + mat[r][j];
            }
        }
        return new Mat4x4(res);
    }

    /**
     * @method sub
     * @description addition of matrices
     * @param {Object} arg a matrix
     * @returns {Mat4x4}
     */
    sub(arg) {
        let res = [];
        let mat = Mat4x4.getData(arg);
        for(let r=0; r < this.data.length; r++) {
            res.push(new Array(4));
            for(let j=0; j < this.data.length; j++) {
                res[r][j] = this.data[r][j] - mat[r][j];
            }
        }
        return new Mat4x4(res);
    }

    /**
     * @method scale
     * @description scalar multiplication of matrices
     * @param {Object} arg a matrix
     * @returns {Mat4x4}
     */
    scale(s) {
        let res = [];
        for(let r=0; r < this.data.length; r++) {
            res.push([]);
            for(let c=0; c < this.data.length; c++) {
                res[r][c] = this.data[r][c] * s;
            }
        }
        return new Mat4x4(res);
    }

    /**
     * @method determinant
     * @description find the determinant of a matrix
     * @returns {Number} the determinant of a matrix
     */
    determinant() {
        let a = this.data[0][0] * (this.data[1][1] * (this.data[2][2] * this.data[3][3] - this.data[2][3] * this.data[3][2]));
        let b = this.data[0][1] * (this.data[1][0] * (this.data[2][2] * this.data[3][3] - this.data[2][3] * this.data[3][2]));
        let c = this.data[0][2] * (this.data[1][0] * (this.data[2][1] * this.data[3][3] - this.data[2][3] * this.data[3][1]));
        let d = this.data[0][3] * (this.data[1][0] * (this.data[2][1] * this.data[3][2] - this.data[2][2] * this.data[3][1]));
        return a - b + c - d;
    }

    /**
     * @method transpose
     * @description transpose a n * m matrix to m * n matrix
     * @returns {Mat4x4} the transpose of a matrix
     */
    transpose() {
        return new Mat4x4([
            [this.data[0][0], this.data[1][0], this.data[2][0], this.data[3][0]],
            [this.data[0][1], this.data[1][1], this.data[2][1], this.data[3][1]],
            [this.data[0][2], this.data[1][2], this.data[2][2], this.data[3][2]],
            [this.data[0][4], this.data[1][4], this.data[2][4], this.data[3][4]]
        ]);
    }

}/**
* @class Vector2
* Principal class for vector's manipulations
*/

class Vector2 {
    /**
     * @static createFrom
     * @description creates a vector from it's argument
     * @param {Object} arg Array or an Array-like to create a vector from
     * @returns {Vector2}
     */
    static createFrom(arg) {
        if(arg instanceof Vector2)
            return arg;
        else if(arg instanceof Array) {
            return new Vector2(arg[0], arg[1]);
        }
        else if(arg instanceof Object) {
            return new Vector2(arg.x, arg.y);
        } else 
            throw new Error("Insufficient vector's data");
    }

    /**
     * @static getDist
     * @description computes the distance between two points
     * @param {Object} v1 origin positional vector
     * @param {Object} v2 end positional vector
     * @returns {Number} the distance between two points
     */
    static getDist(v1, v2) {
        let diff = Vector2.createFrom(v2).sub(Vector2.createFrom(v1));
        return Math.hypot(diff.x, diff.y);
    }

    /**
     * @static cartToPolar
     * @description converts a vector to polar space from cartisian
     * @param {Number} a angle
     * @returns {Vector2} vector in polar space
     */
    // static cartToPolar(a) {
    //     return new Vector2(Math.cos(a), Math.sin(a))
    // }

    /**
     * @constructor
     * @param {Number} x x-component for the vector
     * @param {Number} y y-component for the vector
     * @param {Number} w (optional) w-component for the vector
     */
    constructor(x=0, y=0, w=1) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.o = {x:0, y:0, w:1};
        this.angle = Math.atan2(this.y, this.x);
        this.length = Math.hypot(this.x, this.y);
    }

    /**
     * @method add
     * @description add two vector's together
     * @param {Object} v vector to add with this
     * @returns {Vector2} a new vector 
     */
    add(vec) {
        let v = Vector2.createFrom(vec);
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    /**
     * @method sub
     * @description subtracts a vector from this
     * @param {Object} v vector to be subtracted from this
     * @returns {Vector2} a new vector
     */
    sub(vec) {
        let v = Vector2.createFrom(vec);
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    /**
     * @method scale
     * @description scales each components of a vector by a number
     * @param {Number} s scaling factor for this
     * @returns {Vector2} scaled version of this
     */
    scale(s) {
        return new Vector2(this.x * s, this.y * s);
    }

    /**
     * @method addScale
     * @description adds a scaled vector to this
     * @param {Object} v a vector to be added to this
     * @param {Number} s a scaling factor to this
     * @returns {Vector2}
     */
    addScale(vec, s) {
        let v = Vector2.createFrom(vec);
        return new Vector2(this.x + v.x * s, this.y + v.y * s);
    }

    /**
     * @method mult
     * @description multiply a vector by a vector
     * @param {Object} v vector to be multiplied with this
     * @returns {Vector2}
     */
    mult(vec) {
        let v = Vector2.createFrom(vec);
        return new Vector2(this.x * v.x, this.y * v.y);
    }

    /**
     * @method dot
     * @description determine the dot product of this vector against the argument
     * @param {Object} v  vector to be tested against this
     * @returns {Number} how much this is similar to the other vector
     */
    dot(vec) {
        let v = Vector2.createFrom(vec);
        return this.x * v.x + this.y * v.y;
    }

    /**
     * @method angleBetween
     * @description finds the angle between two vectors
     * @param {Vector2} vec second vector
     */
    angleBetween(vec) {
        let v = Vector2.createFrom(vec);
        return this.dot(v)/(this.length * v.length);
    }

    /**
     * @method getDist
     * @description get the distance between this and other vector
     * @param {Object} v positional vector 
     * @returns {Number} distance between two points
     */
    getDist(v) {
        let diff = Vector2.createFrom(v).sub(this);
        return Math.hypot(diff.x, diff.y);
    }

    /**
     * @method inverse
     * @description get the inverse of the each component in this vector
     * @returns {Vector2} 
     */
    inverse() {
        return new Vector2(1/this.x, 1/this.y)
    }

    /**
     * @method normalise
     * @description get the unit vector of this
     */
    normalise() {
        if(this.length !== 0) 
            return this.scale(1/this.length);
        else 
            return new Vector2();
    }

    /**
     * @method getOrthogonal
     * @description get the orthogonal vector to this
     */
    getOrthogonal() {
        let angle = (90 * Math.PI / 180) + this.angle;
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        return new Vector2(x, y);
    }

    /**
     * @method applyFunc
     * @description apply a function to each component of the vector
     * @param {Function} func function to be applied
     */
    applyFunc(func) {
        return new Vector2(func(this.x), func(this.y));
    }

    /**
     * @method useNMC
     * @description use normalised coordinate
     * @param vec origin vector
     * @returns vector in a normalised coordinate
     */
    useNMC(vec) {
        let v = Vec3d.createFrom(vec);
        this.x += 1;
        this.y += 1;
        this.x *= v.x;
        this.y *= v.y;
        return new Vector2(this.x, this.y, 1);
    }

    /**
     * @method clone
     * @description create a copy of this
     */
    clone() {
        return new Vector2(this.x, this.y);
    }

    /**
     * @method toArray
     * @description creates an array with each components of this vector
     * @returns {Array} containing components of this vectors
     */
    toArray() {
        return [this.x, this.y];
    }

    /**
     * @method toObject
     * @description creates an object with each components of this vector
     * @returns {Object} containing key/value components of this vector respectively
     */
    toObject() {
        return {x: this.x, y:this.y};
    }

    /**
     * @method draw
     * @description visualise this vector
     * @param {CanvasRenderingContext2D} ctx context to draw this vector
     * @param {String} stroke color
     * @param {Number} width width
     */
    draw(ctx, stroke, width=0) {
        ctx.save();
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(this.o.x, this.o.y);
        ctx.lineTo(this.o.x + this.x, this.o.y + this.y);
        ctx.strokeStyle = stroke;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.o.x + this.x, this.o.y + this.y, 3+width, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = stroke;
        ctx.fill();
        ctx.restore();
    }
}/**
* @class Vector3
* Principal class for vector's manipulations
*/

class Vector3 {
    /**
     * @static createFrom
     * @description creates a vector from it's argument
     * @param {Object} arg Array or an Array-like to create a vector from
     * @returns {Vector3}
     */
    static createFrom(arg) {
        if(arg instanceof Vector3)
            return arg;
        else if(arg instanceof Array) {
            return new Vector3(arg[0], arg[1], arg[2], 1);
        }
        else if(arg instanceof Object) {
            return new Vector3(arg.x, arg.y, arg.z, 1);
        } else 
            throw new Error("Insufficient vector's data");
    }

    /**
     * @static getDist
     * @description computes the distance between two points
     * @param {Object} v1 origin positional vector
     * @param {Object} v2 end positional vector
     * @returns {Number} the distance between two points
     */
    static getDist(v1, v2) {
        let diff = Vector3.createFrom(v2).sub(Vector3.createFrom(v1));
        return Math.hypot(diff.x, diff.y);
    }
    
    /**
     * @constructor
     * @param {Number} x x-component of the vector
     * @param {Number} y y-component of the vector
     * @param {Number} z z-component of the vector
     * @param {Number} w (optional) w-component for the vector
     */
    constructor(x=0, y=0, z=0, w=1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.o = {x:0, y:0, z:0, w:1};
        this.length = Math.hypot(this.x, this.y, this.z);
    }

    /**
     * @method add
     * @description add two vector's together
     * @param {Object} v vector to add with this
     * @returns {Vector3} a new vector 
     */
    add(vec) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * @method sub
     * @description subtracts a vector from this
     * @param {Object} v vector to be subtracted from this
     * @returns {Vector3} a new vector
     */
    sub(vec) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * @method scale
     * @description scales each components of a vector by a number
     * @param {Number} s scaling factor for this
     * @returns {Vector3} scaled version of this
     */
    scale(s) {
        return new Vec2d(this.x * s, this.y * s, this.z * s);
    }

    /**
     * @method addScale
     * @description adds a scaled vector to this
     * @param {Object} v a vector to be added to this
     * @param {Number} s a scaling factor to this
     * @returns {Vector3}
     */
    addScale(vec, s) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x + v.x * s, this.y + v.y * s, this.z + v.z * s);
    }

    /**
     * @method mult
     * @description multiply a vector by a vector
     * @param {Object} v vector to be multiplied with this
     * @returns {Vector3}
     */
    mult(vec) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    /**
     * @method dot
     * @description determine the dot product of this vector against the argument
     * @param {Object} v  vector to be tested against this
     * @returns {Number} how much this is similar to the other vector
     */
    dot(vec) {
        let v = Vector3.createFrom(vec);
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * @method cross
     * @description creates a vector perpendicular to this and the other vector
     * @param {Object} vec other vector
     * @returns {Vector3} vector perpendicular to this and the other vector
     */
    cross(vec) {
        let v = Vector3.createFrom(vec);
        let x = this.y * v.z - this.z * v.y;
        let y = this.z * v.x - this.x * v.z;
        let z = this.x * v.y - this.y * v.x;
        return new Vector3(x, y, z);
    }

    /**
     * @method angleBetween
     * @description get the angle between two vectors
     * @param {Object} vec second vector
     * @return {Number} angle between this and other vector in radian
     */
    angleBetween(vec) {
        let v = Vector3.createFrom(vec);
        return this.dot(v)/(this.length * v.length);
    }

    /**
     * @method getDist
     * @description get the distance between this and other vector
     * @param {Object} v positional vector 
     * @returns {Number} distance between two points
     */
    getDist(v) {
        let diff = Vector3.createFrom(v).sub(this);
        return Math.hypot(diff.x, diff.y, diff.z);
    }

    /**
     * @method inverse
     * @description get the inverse of the each component in this vector
     * @returns {Vector3} 
     */
    inverse() {
        return new Vector3(1/this.x, 1/this.y, 1/this.z)
    }

    /**
     * @method normalise
     * @description get the unit vector of this
     */
    normalise() {
        if(this.length !== 0) 
            return this.scale(1/this.length);
        else 
            return new Vector3();
    }

    applyFunc(func) {
        return new Vector3(func(this.x), func(this.y), func(this.z));
    }

    /**
     * @method useNMC
     * @description use normalised coordinate
     * @param vec origin vector 
     * @returns vector in a normalised coordinate
     */
    useNMC(vec) {
        let v = Vector3.createFrom(vec);
        this.x += 1;
        this.y += 1;
        this.x *= v.x;
        this.y *= v.y;
        return new Vector3(this.x, this.y, this.z, this.w);
    }

    /**
     * @method clone
     * @description create a copy of this
     * @returns {Vector3} clone of this
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * @method toArray
     * @description creates an array with each components of this vector
     * @returns {Array} containing components of this vectors
     */
    toArray() {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * @method toObject
     * @description creates an object with each components of this vector
     * @returns {Object} containing key/value components of this vector respectively
     */
    toObject() {
        return {x: this.x, y:this.y, z:this.z, w:this.w};
    }

    draw(ctx, o, stroke, width) {
        let vo = Vector3.createFrom(o);
        ctx.save();
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(vo.x, vo.y);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = stroke;
        ctx.stroke();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.scale(1,1);
        ctx.arc(0, 0, 3, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = stroke;
        ctx.fill();
        ctx.restore();
    }
};// from goalKicker.com HTML5 Canvas Note for professional
class Collision {

	/**
	* @method circle
	* @checks for collisions between two circles
	* @param {Any} c1 the first circle
	* @param {Any} c2 the second circle
	* circle = {pos: , r:}
	*/
	static circle(c1, c2) {
		let diff = Vector2.createFrom(c2.pos).sub(Vector2.createFrom(c1.pos));
		return diff.length <= c1.r + c2.r;
	}
	/**
	* @method rect
	* @checks for collisions between two rectangles
	* @param {Any} r11 the first rectangle
	* @param {Any} r22 the second rectangle
	* rect = {pos: , dimension:}
	*/
	static rect(r11, r22) {
		let r1 = Component.Basic("rect", r11.pos, r11.dimension);
		let r2 = Component.Basic("rect", r22.pos, r22.dimension);
		return r1.pos.x + r1.dimension.x > r2.pos.x && r2.pos.x + r2.dimension.x > r1.pos.x
		&& r1.pos.y + r1.dimension.y > r2.pos.y && r2.pos.y + r1.dimension.y > r1.pos.y;
	}
	/**
	* @method circleRect
	* @checks for collisions between circle and a rectangle
	* @param {Any} c1 the circle
	* @param {Any} r1 the rectangle
	* circle = {pos, r}
	* rect = {pos: , dimension:}
	*/
	static circleRect(c1, r1) {
		let c = Component.Basic("circle", c1.pos, c1.r);
		let r = Component.Basic("rect", r1.pos, r1.dimension);
		let diff = {
			x: Math.abs(c.pos.x - (r.pos.x + r.dimension.x * 0.5)),
			y: Math.abs(c.pos.y - (r.pos.y + r.dimension.y * 0.5))
		};
		if(diff.x > c.r + r.dimension.x * 0.5) return false;
		if(diff.y > c.r + r.dimension.y * 0.5) return false;
		if(diff.x <= r.dimension.x) return true;
		if(diff.y <= r.dimension.y) return true;
		let dx = diff.x - r.dimension.x;
		let dy = diff.y - r.dimension.y;
		return Math.hypot(dx, dy) <= c.r * c.r;
	}
	/**
	* @method lineIntercept
	* @checks if two line segment are intercepting
	* @param {Any} l1 the first line
	* @param {Any} l2 the second line
	* line = {start: , end: }
	*/
	static lineIntercept(l11, l22) {
		let l1 = Component.Basic("line", l11.start, l11.end);
		let l2 = Component.Basic("line", l22.start, l22.end);

		function lineSegmentsIntercept(l1, l2) {
			let v1 = l1.end.sub(l1.start);
			let v2 = l2.end.sub(l2.start);
			let v3 = {x: null, y: null};
			let cross, u1, u2;

			if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
				return false;
			}
			v3 = l1.start.sub(l2.start);
			u2 = (v1.x * v3.y - v1.y * v3.x) / cross;
			if(u2 >= 0 && u2 <= 1) {
				u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
				return u1 >= 0 && u1 <= 1;
			}
			return false;
		}

		return lineSegmentsIntercept(l1, l2);
	}
	/**
	* @method pointAtLineIntercept
	* @checks if two line segment are intercepting
	* @param {Any} l1 the first line
	* @param {Any} l2 the second line
	* line = {start: , end: }
	*/
	static pointAtLineIntercept(l11, l22) {
		let l1 = Component.Basic("line", l11.start, l11.end);
		let l2 = Component.Basic("line", l22.start, l22.end);

		function lineSegmentsIntercept(l1, l2) {
			let v1 = l1.end.sub(l1.start);
			let v2 = l2.end.sub(l2.start);
			let v3 = {x: null, y: null};
			let cross, u1, u2;

			if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
				return false;
			}
			v3 = l1.start.sub(l2.start);
			u2 = (v1.x * v3.y - v1.y * v3.x) / cross;
			if(u2 >= 0 && u2 <= 1) {
				u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
				if(u1 >= 0 && u1 <= 1) {
					return l1.start.addScale(v1, u1);
				}
			}
			return false;
		}

		return lineSegmentsIntercept(l1, l2);
	}
	/**
	* @method lineInterceptCircle
	* @checks if a line intercepts a circle
	* @param {Any} l1 the line
	* @param {Any} c1 the circle
	* line = {start: , end: }
	* circle = {pos:, r:}
	*/
	static lineInterceptCircle(l1, c1) {
		let l = Component.Basic("line", l1.start, l1.end);
		let c = Component.Basic("circle", c1.pos, c1.r);
		let diff = c.pos.sub(l.start);
		let ndiff = l.end.sub(l.start);
		let t = diff.dot(ndiff) / (ndiff.x * ndiff.x + ndiff.y * ndiff.y);
		let nPoint = l.start.addScale(ndiff, t);
		if(t < 0) {
			nPoint.x = l.start.x;
			nPoint.y = l.start.y
		}
		if(t > 1) {
			nPoint.x = l.end.x;
			nPoint.y = l.end.y	
		}
		return (c.pos.x - nPoint.x) * (c.pos.x - nPoint.x) + (c.pos.y - nPoint.y) * (c.pos.y - nPoint.y) < c.r * c.r;
	}
	/**
	* @method lineInterceptRect
	* @checks if a line intercepts a rectangle
	* @param {Any} l1 the line
	* @param {Any} r1 the rectangle
	* line = {start: , end: }
	* circle = {pos:, dimension:}
	*/
	static lineInterceptRect(l1, r1) {
		let l = Component.Basic("line", l1.start, l1.end);
		let r = Component.Basic("rect", r1.pos, r1.dimension);

		function lineSegmentsIntercept(p0, p1, p2, p3) {
			var unknownA = (p3.x-p2.x) * (p0.y-p2.y) - (p3.y-p2.y) * (p0.x-p2.x);
			var unknownB = (p1.x-p0.x) * (p0.y-p2.y) - (p1.y-p0.y) * (p0.x-p2.x);
			var denominator = (p3.y-p2.y) * (p1.x-p0.x) -(p3.x-p2.x) * (p1.y-p0.y);

			if(unknownA==0 && unknownB==0 && denominator==0) return(null);
			if (denominator == 0) return null;

			unknownA /= denominator;
			unknownB /= denominator;
			var isIntersecting=(unknownA>=0 && unknownA<=1 && unknownB>=0 && unknownB<=1)
			return isIntersecting;
		}

		let p = {x: l.start.x, y: l.start.y};
		let p2 = {x: l.end.x, y: l.end.y};

		let q = r.pos;
		let q2 = {x: r.pos.x + r.dimension.x, y: r.pos.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		q = q2;
		q2 = {x: r.pos.x + r.dimension.x, y: r.pos.y + r.dimension.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		q = q2;
		q2 = {x: r.pos.x, y: r.pos.y + r.dimension.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		q = q2;
		q2 = {x: r.pos.x, y: r.pos.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		return false;
	}
	/**
	* @description checks if the point[x, y] is in an arc
	* @param {Vector2} p point to be checked
	* @param {Object} arc arc data
	// arc objects: {pos,innerRadius:,outerRadius:,startAngle:,endAngle:}
	// Return true if the x,y point is inside an arc
	*/
	static isPointInArc(p, arc) {
		if(arc.pos === undefined || arc.innerRadius === undefined || arc.outerRadius 
		=== undefined || arc.startAngle === undefined || arc.endAngle === undefined)
			throw new Error(`Insufficient Arc data: Must provide a "pos, innerRadius, outerRadius, startAngle, endAngle"`);
		let diff = p.sub(Vector2.createFrom(arc.pos));
		let rOuter = arc.outerRadius;
		let rInner = arc.innerRadius;
		if(diff.length < rInner || diff.length > rOuter) return false;
		let angle = (diff.angle + Math.PI * 2) % Math.PI*2;
		return angle >= arc.startAngle && angle <= arc.endAngle;
	}
	/**
	* @description checks if the point[x, y] is in a wedge
	* @param {Vector2} p point to be checked
	* @param {Object} wedge wedge data
	// wedge objects: {pos:,r:,startAngle:,endAngle:}
	// Return true if the x,y point is inside the closed wedge
	*/
	static isPointInWedge(p, wedge) {
		if(wedge.pos === undefined || wedge.r === undefined || wedge.startAngle === undefined)
			throw new Error(`Insufficient Wedge's data: Must provide a "pos, r, startAngle"`);
		let PI2 = Math.PI * 2;
		let diff = p.sub(wedge.pos);
		let r = wedge.r * wedge.r;
		if(diff.length > r) return false;
		let angle = (diff.angle + PI2) % PI2;
		return angle >= wedge.startAngle && angle <= wedge.endAngle;
	}
	/**
	* @description checks if the point[x, y] is in a circle
	* @param {Vector2} p point to be checked
	* @param {Vector2} c circle component
	*/
	static isPointInCircle(p, c) {
		let diff = p.sub(c.pos);
		return (diff.length < c.r * c.r);
	}
	/**
	* @description checks if the point[x, y] is in a rect
	* @param {Vector2} p point to be checked
	* @param {Vector2} c rect component
	*/
	static isPointInRect(p, r) {
		return (p.x > r.pos.x && p.x < r.pos.x + r.dimension.x 
			&& p.y > r.pos.y && p.y < r.pos.y + r.dimension.y);
	}
	
}class TileCamera {
    /**
     * @constructor
     * @param {Vector3} camera's position in 3d space
     * @param {Vector3} camera's dimension in screen
     */
    constructor(pos = new Vector3(), dimension = new Vector3()) {
        this.pos = Vector3.createFrom(pos);
        this.dimension = Vector3.createFrom(dimension);
        this.minPos = new Vector3();
        this.maxPos = new Vector3();

        this._isShaking = false;
    }

    /**
     * @method lookAt
     * @description set the minimum and maximum visible area of the camera
     * @param {Array} map the map
     * @param {Vector2} the size of each tile in the map
     */
    lookAt(map, sizee) {
        let size = Vector3.createFrom(sizee);
        this.pos.z = size.z;
        this.minPos = this.pos.mult(size.inverse()).applyFunc(Math.floor);
        this.maxPos = this.pos.add(this.dimension).mult(
            size.inverse()).applyFunc(Math.ceil);
    }

    /**
     * @method setMapClamp
     * @description set the minimum and maximum indexes from the array
     * @param {Vector2} minn the minimum indexes on the array
     * @param {Vector2} maxx the maximum indexes on the array
     */
    setMapClamp(minn, maxx) {
        let min = Vector3.createFrom(minn);
        let max = Vector3.createFrom(maxx);
        if (this.minPos.x < min.x)
            this.minPos.x = min.x;
        else if (this.maxPos.x > max.x)
            this.maxPos.x = max.x;

        if (this.minPos.y < min.y)
            this.minPos.y = min.y;
        else if (this.maxPos.y > max.y)
            this.maxPos.y = max.y;
    }

    /**
     * @method setMapClamp
     * @description set the minimum and maximum position in worldspace
     * @param {Vector2} minn the minimum position on the canvas
     * @param {Vector2} maxx the maximum position on the canvas
     */
    setPosClamp(minn, maxx) {
        let min = Vector3.createFrom(minn);
        let max = Vector3.createFrom(maxx);
        if (this.pos.x < min.x)
            this.pos.x = min.x;
        else if (this.pos.x + this.dimension.x > max.x)
            this.pos.x = max.x - this.dimension.x;

        if (this.pos.y < min.y)
            this.pos.y = min.y;
        else if (this.pos.y + this.dimension.y > max.y)
            this.pos.y = max.y - this.dimension.y;

        if (this.pos.z < min.z) this.pos.z = min.z;
        else if (this.pos.z > max.z) this.pos.z = max.z;
    }

    /**
     * @method follow
     * @description determines the center of the camera
     * @param {Vector2} poss the positional vector
     * @param {Vector2} dimension the dimension of the component
     */
    follow(poss, dimensionn) {
        if (!this._isShaking) {
        this.pos.x = poss.x + dimensionn.x/2 - this.dimension.x/2;
        this.pos.y = poss.y + dimensionn.y/2 - this.dimension.y/2;
        }
    }

    shakeStart(range) {
        this._isShaking = true;
        let oldPos = new Vector2(this.pos.x, this.pos.y);
        this.pos.x = oldPos.x + Math.sin(Math.random() * 10) * range;
        this.pos.y = oldPos.y + Math.cos(Math.random() * 10) * range;
    }

    shakeEnd() {
        this._isShaking = false;
    }
}class TileMap {
    
    static cartToIso(poss) {
        let pos = Vector2.createFrom(poss);
        return new Vector2(
            pos.x - pos.y,
            (pos.x + pos.y) / 2
        );
    }
    
    static isoToCart(poss) {
        let pos = Vector2.createFrom(poss);
        return new Vector2(
            (2 * pos.y + pos.x) / 2,
            (2 * pos.y - pos.x) / 2
        );
    }
    
    /**
    * @method checkType
    * @description check the type of an array
    * @param {array} the array
    * returns {String}
    */
    static checkType(array) {
        if(array[0][0] !== undefined)
            return "2D";
        return "1D";
    }
    
    /**
    * @method getId
    * @description get the value from an array using the index
    * @param {array} the array
    * @param {pos} the index as a vector
    * @param {dimensionX} (for 1D array) the number of columns
    * returns {Number}
    */
    static getId(array, poss, dimensionX) {
        let pos = Vector2.createFrom(poss);
        if(TileMap.checkType(array) === "2D") {
            return array[pos.y][pos.x];
        } else if(TileMap.checkType(array) === "1D") {
            return array[pos.y * dimensionX + pos.x];
        }
    }
    
    /**
    * set the value of an index in the tiileMap
    */
    static setId(array, poss, dimensionX, value) {
        let pos = Vector2.createFrom(poss);
        if(TileMap.checkType(array) === "2D") {
            array[pos.y][pos.x] = value;
        } else if(TileMap.checkType(array) === "1D") {
            array[pos.y * dimensionX + pos.x] = value;
        }
    }
    
    /**
    * @method indexAt
    * @description get the index from an array using the position
    * @param {pos} the postion as a vector
    * @param {size} size of each tile in the map as a vector
    * returns {Number}
    */
    static indexAt(pos, size) {
        let newPos = Vector2.createFrom(pos);
        let newSize = Vector2.createFrom(size);
        return new Vector2(~~(newPos.x / newSize.x), ~~(newPos.y / newSize.y));
    }
    
    /**
    * @static getTextureIndex
    * @description get the texture index by their value index
    */
    static getTextureIndex(value, col) {
        return new Vector2(~~(value % col), ~~(value / col));
    }
    
    /**
     * @constructor
     * @param {Array} map map data
     * @param {Vector2} size size of each tiles in the map
     */
    constructor(map, size, dimension) {
        if (map instanceof Array) {
            this.map = map;
            this.size = Vector2.createFrom(size);
            // 2D Array
            if (this.map[0][0] != undefined) {
                this.type = "2D";
                this.dimension = Vector2.createFrom({
                    x: this.map[0].length,                     y: this.map.length
                });
            } else {
                this.type = "1D";
                this.dimension = Vector2.createFrom(dimension);
            }
            
            this.draw = null;
            this.texture = {img: null, col:null, size:null};
            
            this.index = new Vector2();
            this.id = null;
        } else {
            throw TypeError(`Failed to Initialize Map: expects an instance of an Array`);
        }
    }
    
    render(minPos, maxPos) {
        let _min = minPos === undefined ? {x:0, y:0}: Vector2.createFrom(minPos);
        let _max = maxPos === undefined ? this.dimension : Vector2.createFrom(maxPos);
        for(let r=_min.y; r < _max.y; r++) {
            for(let c=_min.x; c < _max.x; c++) {
                this.index = new Vector2(c, r);
                this.id = this.getId(this.index);
                if(this.texture.img !== null) {
                    this.textureIndex = TileMap.getTextureIndex(this.id - 1, this.texture.col).applyFunc(Math.floor).mult(this.size);
                }
                if(typeof this.draw === "function") this.draw();
                else 
                    throw new Error(`Map must have a valid draw method`);
            }
        }
    }
    
    
    getId(pos) {
        return TileMap.getId(this.map, pos, this.dimension.x);
    }

    indexAt(pos) {
        return TileMap.indexAt(pos, this.size);
    }

}