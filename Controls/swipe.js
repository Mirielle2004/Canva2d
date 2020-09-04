/**
 * 
 * @description gives a swipe gesture functionality to it's binded element
 * 
 */
class SwipeControl {
    /**
     * 
     * @constructor
     * @param {Object} element elements to add the listener to
     * 
     */
    constructor(element, type="default", debug=false) {
        this.element = element;             
        this.direction = null;              // direction of the swipe
        this.isActive = false;              // flag if swipe is active
        this.pos = new Vector(0, 0);        // position of the cursor on start

        if(type !== undefined) {
            switch(type.toLowerCase()) {

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
                    throw new Error(`Swipe of type "${type}" does not exist`);
            };
        } else {
            this.mouse();
            this.touch();
        }

        this.debug = debug;
    }

    /**
     * 
     * @description check for swipes
     * @param {vector} startPoint starting vector when element is focused
     * @param {vector} endPoint current point during swipe
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
     * @description checks for touch swipe
     */
    touch() {
        this.element.addEventListener("touchstart", e => {
            this.isActive = true;
            this.pos = new Vector(e.touches[0].pageX, e.touches[0].pageY);
            this.checkDebug(console.log, `Swipe Starts...`);
        });

        this.element.addEventListener("touchmove", e => {
            this.checkSwipe(this.pos, new Vector(e.touches[0].pageX, e.touches[0].pageY));
            this.element.dispatchEvent(new CustomEvent("swipe", {
                detail: {
                    e: e,
                    isActive: this.isActive,
                    originX: this.pos.x,
                    originY: this.pos.y,
                    clientX: e.touches[0].pageX,
                    clientY: e.touches[0].pageY,
                    direction: this.direction
                }
            }));
            this.checkDebug(console.log, `${this.direction.toUpperCase()} Swipe`);
            e.preventDefault();
        });

        this.element.addEventListener("touchend", () => {
            this.isActive = false;
            this.pos = new Vector(0, 0);
            this.checkDebug(console.log, `Swipe ends...`);
        });
    }

    /**
     * @description handles mouse swipe
     */
    mouse() {
        this.element.addEventListener("mousedown", e => {
            this.isActive = true;
            this.pos = new Vector(e.clientX, e.clientY);
            this.checkDebug(console.log, `Swipe Starts.....`);
        });

        this.element.addEventListener("mousemove", e => {
            if(this.isActive) {
                this.checkSwipe(this.pos, new Vector(e.clientX, e.clientY));
                    this.element.dispatchEvent(new CustomEvent("swipe", {
                    detail: {
                        e: e,
                        isActive: this.isActive,
                        originX: this.pos.x,
                        originY: this.pos.y,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        direction: this.direction
                    }
                }));

                this.checkDebug(console.log, `${this.direction.toUpperCase()} Swipe`);
            }
        });

        this.element.addEventListener("mouseup", () => {
            this.isActive = false;
            this.pos = new Vector(0, 0);
            this.checkDebug(console.log, `Swipe Ends...`);
        });
    }
     
}



Object.assign(SwipeControl.prototype, AbstractBaseMixin);
