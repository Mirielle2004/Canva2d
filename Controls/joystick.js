/**
 * @description principal object that initializes and draw a joystick
 * 
 * It accepts a canvas element as it's first arguement then some keywords argument which are
 * {
 *      dynamic: joystick can appear anywhere in the world if true
 *      debug:   Keep track of the joystick's processes through messages in the console
 *      origin:  Vector containing information about the location of the joystick
 *      pos:     dynamic vector containing location's info of the movable joystick circle
 *      direction: direction of the joystick
 *      
 *      styles to the movable joystick circle:
 *          color
 *          lineWidth
 *          outlineColor
 *          innerRadius
 * 
 *      styles to the static joystick circle:
 *          backgroundColor
 *          backgroundLineWidth
 *          backgroundOutlineColor
 *          outterRadius
 *      
 *      isActive: says if the joystick is active
 *      isDisplay: says if the joystick is display
 *      isFading: says if the joystick is Fading
 * 
 *      timeSpan: accepts it value as arg.fadeIn and determine how long a joystick should stay before fading in
 * }
 */

class Joystick {
    /**
     * 
     * @constructor
     * @param {object} arg an object that accepts a predefined keys and map
     * their values to the respected component of the joystick
     * 
     */
    constructor(canvas, arg) {
        this.canvas = canvas;
        try {
            this.ctx = this.canvas.getContext("2d");
        } catch (error) {
            throw new Error("Joystick Failed to intialize CANVAS");
        }
        this.dynamic = (arg.dynamic === false) ? false:true;
        this.debug = arg.debug || false;
        this.origin = new Vector(arg.x || 0, arg.y || 0);
        this.pos = new Vector(arg.x || 0, arg.y || 0);
        this.direction = null;

        // styling
        this.color = arg.color || "lightgray";
        this.lineWidth = arg.lineWidth || 4;
        this.outlineColor = arg.outlineColor || "#222";
        this.innerRadius = arg.innerRadius || 15;
        this.backgroundColor = arg.backgroundColor || "none";
        this.backgroundOutlineColor = arg.backgroundOutlineColor || "#222";
        this.backgroundLineWidth = arg.backgroundLineWidth || 4;
        this.outerRadius = arg.outerRadius || 50;
        
        this.isActive = false;
        // animation
        this.timeSpan = arg.fadeIn || 100;  
        this.timeSpanCounter = this.timeSpan;
        this.speedCounter = 0;
        this.isDisplay = false;
        this.isFading = false;
        this.alpha = 1;

        if(arg.type !== undefined) {
            switch(arg.type.toLowerCase()) {

                case "touch":
                    this.touch();
                    break;
    
                case "mouse":
                    this.mouse();
                    break;
    
                case "default":
                    this.mouse();
                    this.touch();
                    break;
                default:
                    console.error(`${arg.type} types does not exists`);
            };
        } else {
            this.mouse();
            this.touch();
        }

        this.checkDebug(console.log, "Joystick Initialized successfully");
    }

    /**
     * @description draw joystick on the canvas
     */
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.Joystick2dArc( this.origin.x, this.origin.y, this.outerRadius, 
            this.backgroundColor, this.backgroundOutlineColor, this.backgroundLineWidth);
        this.ctx.Joystick2dArc( this.pos.x, this.pos.y, this.innerRadius, 
            this.color, this.outlineColor, this.lineWidth);
        this.ctx.restore();
    }

    /**
     * @description fade in the joystick when not active
     */
    fadeIn() {
        if(this.isFading) {
            this.timeSpanCounter-=1;
            this.alpha = Math.abs(this.timeSpanCounter / this.timeSpan);
            if(this.alpha <= 0) {
                this.isDisplay = false;
                this.timeSpanCounter = this.timeSpan;
            }
        }
    }

    checkSwipe(startPoint, endPoint) {
        let newPos = endPoint.subtract(startPoint);
        if(Math.abs(newPos.x) > Math.abs(newPos.y)) {
            if(newPos.x < 0) 
                this.direction = "left";
            else this.direction = "right";
        } else {
            if(newPos.y < 0)
                this.direction = "top";
            else this.direction = "down";
        }
    }

    /**
     * Listen to joystic events with mouse
     */
    mouse() {
        this.canvas.addEventListener("mousedown", e => {
            if(this.dynamic) {
                let cssPos = this.canvas.getBoundingClientRect();
                this.origin = new Vector(e.clientX, e.clientY)
                    .subtract({x: cssPos.x, y: cssPos.y});
                this.pos = new Vector(e.clientX, e.clientY)
                    .subtract({x: cssPos.x, y: cssPos.y});;
                this.isDisplay = true;           
                this.isFading = false;
                this.alpha = 1;
            }
            this.isActive = true;
            this.checkDebug(console.log, `Joystick Starting...`);
        });

        this.canvas.addEventListener("mousemove", e => {
            if(this.isActive) {
                let cssPos = this.canvas.getBoundingClientRect();
                let newPos = new Vector(e.clientX, e.clientY)
                    .subtract({x: cssPos.x, y: cssPos.y})
                    .subtract(this.origin);
                this.checkSwipe(this.origin, new Vector(e.clientX, e.clientY));
                let radius = Math.min(newPos.magnitude, this.outerRadius);
                this.pos.x = this.origin.x + Math.cos(newPos.angle) * radius;
                this.pos.y = this.origin.y + Math.sin(newPos.angle) * radius;

                this.canvas.dispatchEvent(new CustomEvent("joystick", {
                    detail: {
                        e: e,
                        angle: newPos.angle,
                        magnitude: newPos.magnitude,
                        direction: this.direction,
                        origin: this.origin,
                        client: new Vector(e.clientX, e.clientY),
                        pos: this.pos,
                        isActive: this.isActive,
                    }
                }));

                this.checkDebug(console.log, `${~~(newPos.angle * 180 / Math.PI)} angle`);
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            if(this.dynamic) {
                this.isActive = false;
                this.isFading = true;
            } else {
                this.pos = new Vector(this.origin.x, this.origin.y);
            }
            this.direction = null;
            this.checkDebug(console.log, `Joystick waiting...`);
        });
    }

    /**
     * Listen to joystic events on touch
     */
    touch() {
        this.canvas.addEventListener("touchstart", e => {
            if(this.dynamic) {
                let cssPos = this.canvas.getBoundingClientRect();
                this.origin = new Vector(e.touches[0].pageX, e.touches[0].pageY)
                    .subtract({x: cssPos.x, y: cssPos.y});
                this.pos = new Vector(e.touches[0].pageX, e.touches[0].pageY)
                    .subtract({x: cssPos.x, y: cssPos.y});
                this.isDisplay = true;
                this.isFading = false;
                this.alpha = 1;
            }
            this.isActive = true;
            this.checkDebug(console.log, `Joystick Starting...`);
        });

        this.canvas.addEventListener("touchmove", e => {
                let cssPos = this.canvas.getBoundingClientRect();
                let newPos = new Vector(e.touches[0].pageX, e.touches[0].pageY)
                    .subtract({x: cssPos.x, y: cssPos.y})
                    .subtract(this.origin);
                let radius = Math.min(newPos.magnitude, this.outerRadius);
                this.pos.x = this.origin.x + Math.cos(newPos.angle) * radius;
                this.pos.y = this.origin.y + Math.sin(newPos.angle) * radius;

                this.canvas.dispatchEvent(new CustomEvent("joystick", {
                    detail: {
                        e: e,
                        angle: newPos.angle,
                        magnitude: newPos.magnitude,
                        origin: this.origin,
                        client: new Vector(e.touches[0].pageX, e.touches[0].pageY),
                        pos: this.pos,
                        isActive: this.isActive,
                    }
                }));
                e.preventDefault();
                this.checkDebug(console.log, `${~~(newPos.angle * 180 / Math.PI)} angle`);
        });

        this.canvas.addEventListener("touchend", () => {
            if(this.dynamic) {
                this.isActive = false;
                this.isFading = true;
            } else {
                this.pos = new Vector(this.origin.x, this.origin.y);
            }
            this.checkDebug(console.log, `Joystick waiting...`);
        });
    }

    /**
     * @description Shows the actual joystick on the screen
     */
    show() {
        if(this.dynamic) {
            if(this.isDisplay) this.draw();
            this.fadeIn();
        } else {
            this.isFading = false;
            this.isDisplay = true;
            this.alpha = 1;
            this.draw();
        }
        
    }
}


Object.assign(Joystick.prototype, AbstractBaseMixin);
