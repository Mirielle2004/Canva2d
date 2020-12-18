class JoyStick {

    /**
     * @constructor
     * @param {String} type controller's type
     */
    constructor(type) {
        this.canvas.style.left = this.styles.pos.x + "%";
        this.canvas.style.top = this.styles.pos.y + "vh";

        // origin
        this._origin = {x: this.canvas.width/2, y:this.canvas.height/2};
        this._throwtle = {x:this._origin.x, y:this._origin.y};

        // animation's parameters when dynamic is true
        this.isActive = false;
        this.isDisplay = this.styles.dynamic ? false : true;
        this.isFading = false;
        this.alpha = 1;
        this.timeSpan = this.styles.timeOut || 100;  
        this.timeSpanCounter = this.timeSpan;

        // functions
        this.onStart = null;
        this.onActive = null;
        this.onMove = null;
        this.onEnd = null;

        // data
        this.data = {
            angle: 0,
            direction: "static",
            length: 0,
            mouse: null,
            touch: null,
        };

        document.body.appendChild(this.canvas);

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
                    console.error(`${type} controller does not exists`);
            };
        } else {
            if ("ontouchstart" in window)
                this.touch();
            else if("onmousedown" in window)
                this.mouse();
        }
    }

    /**
     * @method setStyle
     * @description set single joystick style
     * @param {String} key styling property
     * @param {Any} value style value
     */
    setStyle(key, value) {
        if(this.styles.hasOwnProperty(key))
            this.styles[key] = value;
        this.canvas.width = this.styles.outerRadius * 2 + this.styles.innerRadius + 20;
        this.canvas.height = this.styles.outerRadius * 2 + this.styles.innerRadius + 20;
        this.canvas.style.left = this.styles.pos.x + "%";
        this.canvas.style.top = this.styles.pos.y + "vh";
    }

    /**
     * @method SetStyles
     * @description set multiple joystick styles
     * @param {Object} styles styling data
     */
    setStyles(styles) {
        for(const i in styles) {
            if(this.styles.hasOwnProperty(i))
                this.styles[i] = styles[i];
        }
        this.canvas.width = this.styles.outerRadius * 2 + this.styles.innerRadius + 20;
        this.canvas.height = this.styles.outerRadius * 2 + this.styles.innerRadius + 20;
        this.canvas.style.left = this.styles.pos.x + "%";
        this.canvas.style.top = this.styles.pos.y + "vh";
    }

    /**
     * @method draw
     * @description draw the joystick
     */
    draw() {
        let style = this.styles;
        let origin = style.origin;
        let pos = style.pos;

        this._ctx.save();
        this._ctx.globalAlpha = this.alpha;
        // draw Vec
        if(style.showVector) {
            this._ctx.beginPath();
            this._ctx.moveTo(this._origin.x, this._origin.y);
            this._ctx.lineTo(this._throwtle.x, this._throwtle.y);
            this._ctx.closePath();
            this._ctx.strokeStyle = "green";
            this._ctx.stroke();
        }
        this._draw(this._origin.x, this._origin.y, style.outerRadius, 
            style.backgroundColor, style.backgroundOutlineColor, style.backgroundLineWidth);
        this._draw(this._throwtle.x, this._throwtle.y, style.innerRadius, 
            style.color, style.outlineColor, style.lineWidth);
        this._ctx.restore();
    }

    /**
     * @method mouse
     * @description initialize mouse controller for the joystick
     */
    mouse() {
        let style = this.styles;
        window.addEventListener("mousedown", e => {
            if(style.dynamic) {
                if(this.isActive) {
                    this.isDisplay = true;           
                    this.isFading = false;
                    this.alpha = 1;
                    this.isActive = true;
                    this.canvas.style.left = this.clientX + "px";
                    this.canvas.style.top = this.clientY + "px";
                }
            }
        });

        window.addEventListener("mousemove", e => {
            let cssPos = this.canvas.getBoundingClientRect();
            let nPos = {
                x: e.clientX - cssPos.left - this._origin.x,
                y: e.clientY - cssPos.top - this._origin.y
            };
            if(this.isActive) {
                let length = Math.hypot(nPos.x, nPos.y);
                let radius = Math.min(length, this.styles.outerRadius);
                let angle = Math.atan2(nPos.y, nPos.x);
                let dir = getSwipeDirection(this._origin, this._throwtle);
                this._throwtle = {
                    x: this._origin.x + Math.cos(angle) * radius,
                    y: this._origin.y + Math.sin(angle) * radius
                };
                this.data = {
                    angle: angle,
                    direction: dir[1],
                    length: length
                };
                if(typeof this.onMove === "function")
                    this.onMove();
            }
        });

        window.addEventListener("mouseup", e => {
            this._throwtle = {
                x: this._origin.x,
                y: this._origin.y
            };
            this.data = {
                angle: 0,
                direction: "none",
                length: 0
            };
            if(style.dynamic)
                this.isFading = true;
            if(this.isActive) {
                if(typeof this.onEnd === "function")
                    this.onEnd();
                this.isActive = false;
            }
        });
    }

    /**
     * @method touch
     * @description initialize touch controller for the joystick
     */
    touch() {
        let style = this.styles;
        window.addEventListener("touchstart", e => {
            if(style.dynamic) {
                this.data.touch = e;
                this.clientX = e.touches[0].pageX - this.canvas.width/2;
                this.clientY =  e.touches[0].pageY - this.canvas.height/2;
                this.isActive = true;
                if(typeof this.onStart === "function")
                    this.onStart();
                if(this.isActive) {
                    this.isDisplay = true;           
                    this.isFading = false;
                    this.alpha = 1;
                    this.isActive = true;
                    this.canvas.style.left = this.clientX + "px";
                    this.canvas.style.top = this.clientY + "px";
                }
            }
        });

        this.canvas.addEventListener("touchstart", e => {
            this.data.touch = e;
            let cssPos = this.canvas.getBoundingClientRect();
            if(!style.dynamic) {
                let p = {
                    x: e.touches[0].pageX - cssPos.left,
                    y: e.touches[0].pageY - cssPos.top
                };
                let diff = {x:this.canvas.width/2 - p.x, y:this.canvas.height/2 - p.y};
                let l = (Math.hypot(diff.x, diff.y));
                if(Math.hypot(diff.x, diff.y) < style.innerRadius) {
                    this.isActive = true;
                    if(typeof this.onStart === "function")
                        this.onStart();
                }
            }
        });

        window.addEventListener("touchmove", e => {
            let cssPos = this.canvas.getBoundingClientRect();
            let nPos = {
                x: e.touches[0].pageX - cssPos.left - this._origin.x,
                y: e.touches[0].pageY - cssPos.top - this._origin.y
            };
            if(this.isActive) {
                let length = Math.hypot(nPos.x, nPos.y);
                let radius = Math.min(length, this.styles.outerRadius);
                let angle = Math.atan2(nPos.y, nPos.x);
                // let dir = this.getDirection(this._origin, {x:e.clientX, y:e.clientY});
                this._throwtle = {
                    x: this._origin.x + Math.cos(angle) * radius,
                    y: this._origin.y + Math.sin(angle) * radius
                };
                this.data = {
                    angle: angle,
                    direction: "none",
                    length: length
                };
                if(typeof this.onMove === "function")
                    this.onMove();
            }
        });

        window.addEventListener("touchend", e => {
            this._throwtle = {
                x: this._origin.x,
                y: this._origin.y
            };
            this.data = {
                angle: 0,
                direction: "none",
                length: 0
            };
            if(style.dynamic)
                this.isFading = true;
            if(this.isActive) {
                if(typeof this.onEnd === "function")
                    this.onEnd();
                this.isActive = false;
            }
        });
    }
    
    /**
     * @method animate
     * @param {CanvasRenderingContext2D} ctx graphics renderer
     * @param {Function} callback callback function
     */
    animate(ctx, callback) {
        function anime() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            callback();
            requestAnimationFrame(anime);
        };
        requestAnimationFrame(anime);
    }

    /**
     * @method init
     * @description method to be call to render the joystick
     */
    init() {
        this.animate(this._ctx, () => {
            this.show();
        })
    }

    /**
     * @description fadeIn effect for dynamic joystick
     */
    fadeIn() {
        if(this.isFading) {
            this.timeSpanCounter-=1;
            this.alpha = Math.abs(this.timeSpanCounter / this.timeSpan);
            if(this.alpha <= 0) {
                this.isDisplay = false;
                this.isFading = false;
                this.timeSpanCounter = this.timeSpan;
            }
        }
    }

    /**
     * @description decided wether the joystick should be shown
     */
    show() {
        if(this.styles.dynamic) {
            this.fadeIn();
        } else {
            this.isDisplay = true;
            this.isFading = false;
            this.alpha = 1;
        }
        if(this.isDisplay) this.draw();
        
    }
};

return new JoyStick(type);
