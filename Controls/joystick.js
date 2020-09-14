/**
 * Canva2D Joystick creator
 */
class JoyStick {

    /**
     * 
     * @constructor
     * @param {object} params setup for joystick
     * 
     */
    constructor({canvas, x=0, y=0, dynamic=true, 
    innerRadius=15, outerRadius=50, color="lightgray", 
    lineWidth=4, outlineColor="#222", backgroundColor="none", 
    backgroundOutlineColor="#222", backgroundLineWidth=4,
    fadeTimeout=100, type="default"}) {
        
        this.canvas = canvas;
        try {
            this.ctx = this.canvas.getContext("2d");
        } catch (error) {
            throw new Error("Joystick Failed to intialize CANVAS");
        }
        this.dynamic = (dynamic === false) ? false:true;
        this.origin = new Vector(x, y);
        this.pos = new Vector(x, y);
        this.direction = null;

        // styling
        this.color = color;
        this.lineWidth = lineWidth;
        this.outlineColor = outlineColor;
        this.innerRadius = innerRadius;
        this.backgroundColor = backgroundColor;
        this.backgroundOutlineColor = backgroundOutlineColor;
        this.backgroundLineWidth = backgroundLineWidth;
        this.outerRadius = outerRadius;
        
        this.isActive = false;
        // animation
        this.timeSpan = fadeTimeout;  
        this.timeSpanCounter = this.timeSpan;
        this.speedCounter = 0;
        this.isDisplay = false;
        this.isFading = false;
        this.alpha = 1;

        if(type !== undefined) {
            switch(type.toLowerCase()) {

                case "touch":
                    this.touch();
                    break;
    
                case "mouse":
                    this.mouse();
                    break;
    
                case "default":
                    if ("ontouchstart" in window)
                        this.touch();
                    else if("onmousedown" in window)
                        this.mouse();
                    break;
                default:
                    console.error(`${params.type} types does not exists`);
            };
        } else {
            if ("ontouchstart" in window)
                this.touch();
            else if("onmousedown" in window)
                this.mouse();
        }
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
     * @description Add a fadeIn-Out effect to the Joystick
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

    /**
     * 
     * @description checks in which direction the joystick is drag to
     * @param {Vector} startPoint starting pos of the joystick movement
     * @param {Vector} endPoint current pos of the joystick movement
     * 
     */
    checkSwipe(startPoint, endPoint) {
        let newPos = endPoint.subtract(startPoint);
        if(Math.abs(newPos.x) > Math.abs(newPos.y)) {
            if(newPos.x < 0) 
                this.direction = "left";
            else this.direction = "right";
        } else {
            if(newPos.y < 0)
                this.direction = "up";
            else this.direction = "down";
        }
    }

    /**
     * @description joystick control with mouse
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
                        originX: this.origin.x,
                        originY: this.origin.y,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        isActive: this.isActive,
                    }
                }));
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            if(this.dynamic) {
                this.isFading = true;
            } else {
                this.pos = new Vector(this.origin.x, this.origin.y);
            }
            this.direction = null;
            this.isActive = false;
        });
    }

    /**
     * @description joystick control with touch
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
        });

        this.canvas.addEventListener("touchmove", e => {
                let cssPos = this.canvas.getBoundingClientRect();
                let newPos = new Vector(e.touches[0].pageX, e.touches[0].pageY)
                    .subtract({x: cssPos.x, y: cssPos.y})
                    .subtract(this.origin);
                let radius = Math.min(newPos.magnitude, this.outerRadius);
                this.pos.x = this.origin.x + Math.cos(newPos.angle) * radius;
                this.pos.y = this.origin.y + Math.sin(newPos.angle) * radius;

                this.checkSwipe(this.origin, new Vector(e.clientX, e.clientY));

                this.canvas.dispatchEvent(new CustomEvent("joystick", {
                    detail: {
                        e: e,
                        angle: newPos.angle,
                        magnitude: newPos.magnitude,
                        direction: this.direction,
                        originX: this.origin.x,
                        originY: this.origin.y,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        isActive: this.isActive,
                    }
                }));
                e.preventDefault();
        });

        this.canvas.addEventListener("touchend", () => {
            if(this.dynamic) {
                this.isFading = true;
            } else {
                this.pos = new Vector(this.origin.x, this.origin.y);
            }
            this.isActive = false;
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

    /**
     * @description hides the joystick
     */
    hide() {
        this.isDisplay = false;
        this.isActive = false;
    }
}
