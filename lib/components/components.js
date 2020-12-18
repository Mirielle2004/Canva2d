{
    let Vector2 = Canva2D.API.Vector2;

    Canva2D.API.Component = {

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
    };


    // SHAPE COMPONENT
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
    } // basic component ends



    class SpriteComponent {
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
    } // sprite component ends



    class TileComponent {
    
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
        
    } // tile component

}