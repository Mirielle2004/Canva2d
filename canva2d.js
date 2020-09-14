/**
 * Name         : Canva2d.js
 * @author      : Mirielle S. (codeBreaker!)
 * Last Modified: 14.09.2020
 * Revision     : 0.0.5
 * 
 * MIT License
 * 
 * Copyright (c) 2020 CodeBreaker
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
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
 */


let CURRENT_CONTEXT;
let CURRENT_SCENE;

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000/60);
    }
})();


CanvasRenderingContext2D.prototype.__proto__ = {

    /**
     * @description suitable for clearing screen in during animation
     * @param {number} x starting point of the rectangle
     * @param {number} y starting point of the rectangle on the Y-axis
     * @param {number} w width of the rectangle
     * @param {number} h height of the rectangle
     * @param {string} color color of the rectangle
     */
    clearColor(x, y, w, h, color) {
        this.fillStyle = color;
        if(color !== undefined)
            this.fillRect(x, y, w, h);
        else this.clearRect(x, y, w, h);
    },

    /**
     * 
     * @description Draws an arc made specially for joystick
     * @param {number} x centre point on the X-axis
     * @param {number} y centre point on the Y-axis
     * @param {number} radius radius of the circle
     * @param {string} fill fillStyle for the circle
     * @param {string} stroke strokeStyle for the circle
     * @param {number} width thickness only if strokeStyle is being used
     * 
     */

    Joystick2dArc(x, y, radius, fill, stroke, width=0) {
        this.save();
        this.lineWidth = width;
        this.strokeStyle = stroke || fill;
        this.fillStyle = fill;
        this.beginPath();
        this.arc(x, y, radius, 0, 2 * Math.PI);
        this.closePath();
        if(!(stroke === "none" || stroke === "")) this.stroke();
        if(!(fill === undefined || fill === "none" || fill === "")) this.fill();
        this.restore();
    }

};


/**
 * @description 2D Vector's position of an object
 * @param {Number} x position of an object on the X-axis
 * @param {Number} y position of an object on the Y-axis
 * 
 */
const Vector  = function(x, y) {
    this.x = x;
    this.y = y;
    this.magnitude = Math.hypot(this.x, this.y);
    this.angle = Math.atan2(this.y, this.x);
};


Vector.prototype = {

/**
 * @description scale vector's componet into their unit length
 */
normalise() {
    this.x /= this.magnitude;
    this.y /= this.magnitude;
},

/**
 * @description get the addition result of two vectors
 * @param {Vector} v vector with a defined x, y
 * 
 */
add(v) {
    let x = this.x + v.x;
    let y = this.y + v.y;
    return new Vector(x, y);
},

/**
 * @description get the subtraction result of two vectors
 * @param {Vector} v vector with a defined x, y
 * 
 */
subtract(v) {
    let x = this.x - v.x;
    let y = this.y - v.y;
    return new Vector(x, y);
},

/**
 * @description get the product of two vectors
 * @param {Vector} v vector with a defined x, y
 * 
 */
multiply(v) {
    let x = this.x * v.x;
    let y = this.y * v.y;
    return new Vector(x, y);
},

/**
 * @description get the dot product of two vectors
 * @param {Vector} v vector with a defined x, y
 * 
 */
dot(v) {
    let x = this.x * v.x;
    let y = this.y * v.y;
    return x + y;
}
};



Vector.__proto__ = {

getDist(v1, v2) {
    let diff = new Vector(v2.x, v2.y)
    .subtract({x: v1.x, y: v1.y});
    return diff.magnitude;
},

getPolarCoord(angle = 0, magnitude = 0) {
    let x = Math.cos(angle) * magnitude;
    let y = Math.sin(angle) * magnitude;
    return new Vector(x, y);
}

};


/**
 * @description
 * principal class containing various set of collision utility functions
 * 
 */
class Collision {

    /**
     * @description checks collison between two circles
     * @param {Component} c1 circle component with a defined x, y, r
     * @param {Component} c2 circle component with a defined x, y, r
     * 
     */
    static circle(c1, c2) {
        return Vector.getDist(c1, c2) < c1.r + c2.r;
    }

    /**
     * @description checks collison between two rectangles
     * @param {Component} r1 rectangle component with a defined x, y, w, h
     * @param {Component} r2 rectangle component with a defined x, y, w, h
     * 
     */
    static rect(r1, r2) {
        return r1.x + r1.w > r2.x && r2.x + r2.w > r1.x 
        && r1.y + r1.h > r2.y && r2.y + r2.h > r1.y;
    }

    /**
     * @description checks collison between a rectangle and a circle
     * @param {Component} r rectangle component with a defined x,y,w,h
     * @param {Component} c circle component with a defined x, y, r
     * 
     */
    static rectCircle(r, c) {
        var dx = Math.abs(c.x - (r.x + r.w * .5));
        var dy = Math.abs(c.y - (r.y + r.h * .5));

        if(dx > c.r + r.w * .5) return false;
        if(dy > c.r + r.h * .5) return false;

        if(dx <= r.w) return true;
        if(dy <= r.h) return true;

        var dx = dx - r.w;
        var dy = dy - r.h;
        return (dx * dx + dy * dy <= c.r * c.r);
    }

    /**
     * @description checks if two lines are intersecting
     * @param {Component} l1 line component with a defined x0, y0, x1, y1
     * @param {Component} l2 line component with a defined x0, y0, x1, y1
     * 
     */    
    static lineIntercept(l1, l2) {
        let v1, v2, v3, cross, u1, u2;

        v1 = new Vector(l1.x1, l1.y1)
            .subtract({x: l1.x0, y: l1.y0});
        v2 = new Vector(l2.x1, l2.y1)
            .subtract({x: l2.x0, y: l2.y0});
        if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
            return false;
        }
        v3 = {x: l1.x0 - l2.x0, y: l1.y0 - l2.y0};
        u2 = (v1.x * v3.y - v1.y * v3.x) / cross;

        if(u2 >= 0 && u2 <= 1) {
            u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
            return (u1 >= 0 && u1 <= 1);
        }
        return false;
    }

    /**
     * @description checks if a line is intersecting with a circle
     * @param {Component} l line component with a defined x0, y0, x1, y1
     * @param {Component} c circle component with a defined x, y, r
     * 
     */
    static lineInterceptCircle(l, c) {

        let diffA = new Vector(c.x, c.y).subtract({x: l.x0, y: l.y0});
        let diffB = new Vector(l.x1, l.y1).subtract({x: l.x0, y: l.y0});
        let dot = diffA.dot(diffB) / diffB.dot(diffB);
        
        let x = l.x0 + diffB.x * dot;
        let y = l.y0 + diffB.y * dot;

        if(dot < 0) {
            x = l.x0;
            y = l.y0;
        }

        if(dot > 1) {
            x = l.x1;
            y = l.y1;
        }
        let res = new Vector(c.x - x, c.y - y).dot({x: c.x - x, y: c.y - y});
        return res < c.r * c.r;
    }

    /**
     * @description checks if a line is intersecting with a rect
     * @param {Component} l line component with a defined x0, y0, x1, y1
     * @param {Component} r rect component with a defined x, y, w, h
     * 
     */
    static lineInterceptRect(l, r) {

        const lineSegmentCollide = (l1, l2) => {
            let p0 = {x: l1.x0, y: l1.y0};
            let p1 = {x: l1.x1, y: l1.y1};
            let p2 = {x: l2.x0, y: l2.y0};
            let p3 = {x: l2.x1, y: l2.y1};
            let unknownA = (p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x);
            let unknownB = (p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x);
            let denominator = (p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y);

            if(unknownA == 0 && unknownB == 0 && denominator == 0) return null;

            if(denominator == 0) return null;

            unknownA /= denominator;
            unknownB /= denominator;

            let intersecting = (unknownA >= 0 && unknownA <= 1 && unknownB >= 0 && unknownB <= 1);
            return intersecting;
        };

        // top rect line
        var q = {x0: r.x, y0: r.y, x1: r.x + r.w, y1: r.y + r.h};
        if(lineSegmentCollide(l, q)) return true;

        // right rect line
        var q = {x0: r.x + r.w, y0: r.y + r.h, x1: r.x + r.w, y1: r.y + r.h};
        if(lineSegmentCollide(l, q)) return true;

        // bottom rect line
        var q = {x0: r.x + r.w, y0: r.y + r.h, x1: r.x, y1: r.y + r.h}
        if(lineSegmentCollide(l, q)) return true;

        // left rect line
        var q = {x0: r.x, y0: r.y + r.h, x1: r.x, y1: r.y};
        if(lineSegmentCollide(l, q)) return true;

        return false;
    }

    /**
     * @description checks if a vector is in an arc
     * @param {Vector} v vector with a defined x, y
     * @param {Object} arc arc infomations.
     * {x, y, angle0, angle1, r1, r2}. 
     * [x, y] is the position of the arc.
     * [angle0, angle1] are the starting and ending angles respectively.
     * [r0, r1] are the inner and outer radius of the arc respectiively.
     * 
     */
    static pointAtArc(v, arc) {
        let diff = new Vector(v.x, v.y).subtract({x:arc.x, y: arc.y});
        let dxy = diff.dot(diff);
        let oR = arc.r1 * arc.r1;   // outer radius
        let iR = arc.r0 * arc.r0;   // inner radius
        if(dxy < iR || dxy > oR) return false;
        let angle = (diff.angle + Math.PI * 2) % (Math.PI * 2);
        return angle >= arc.angle0 && angle <= arc.angle1;
    }

    /**
     * @description checks if a vector is in a wedge
     * @param {Vector} v vector with a defined x, y
     * @param {Object} w wedge informations that must include
     * [x, y, r, angle0, angle1].. angle0 and angle1 are the 
     * starting angle and ending angle respectively.
     * 
     */
    static pointAtWedge(v, w) {
        let diff = new Vector(v.x, v.y).subtract(
            {x: w.x, y: w.y});
        let rr = w.r * w.r;
        if(diff.x * diff.x + diff.y * diff.y > rr) return false;
        let angle = (diff.angle + Math.PI * 2) % (Math.PI * 2);
        return angle >= w.angle0 && angle <= w.angle1;
    }

    /**
     * @description checks if a vector is in a circle
     * @param {Vector} v vector with a defined x, y
     * @param {Component} c circular components with a defined x, y, r
     * 
     */
    static pointAtCircle(v, c) {
        let diff = new Vector(c.x, c.y).subtract({
            x: v.x, y: v.y});
        return (diff.x * diff.x + diff.y * diff.y < c.r * c.r);
    }

    /**
     * @description checks if a vector is in a semi-circle
     * @param {Vector} v vector with a defined x, y
     * @param {Component} c circular components with a defined x, y, r
     * 
     */
    static pointAtCircleCentre(v, c) {
        let diff = new Vector(c.x, c.y).subtract({
            x: v.x, y: v.y});
        return (diff.x * diff.x + diff.y * diff.y < c.r);
    }

    /**
     * @description checks if a point is in a rectangle
     * @param {Vector} v vector with a defined x, y
     * @param {Component} r rectangular component with a defined x, y, w, h
     * 
     */
    static pointAtRect(v, r) {
        return v.x > r.x && v.x < r.x + r.w && v.y > r.y && v.y < r.y + r.h;
    }

    /**
     * @description checks if a point is in quater of a rect
     * @param {Vector} v vector with a defined x, y
     * @param {Component} r rectangular component with a defined x, y, w, h
     * 
     */
    static pointAtSemiRect(v, r) {
        return v.x > r.x && v.x < r.x + r.w * .05 && v.y > r.y && v.y < r.y + r.h * .05;
    }

    static elastic(b1, b2) {

        const axisRotation = (v, angle) => ({
            x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
            y: v.x * Math.sin(angle) + v.y * Math.cos(angle)
        });

        let velDiff = new Vector(b1.vel.x, b1.vel.y)
            .subtract({x: b2.vel.x, y: b2.vel.y});
        let vecDiff = new Vector(b2.x, b2.y)
            .subtract({x: b1.x, y: b1.y});
        // if objects aren't overlapping
        if(vecDiff.dot(velDiff) >= 0) {
            let angle = -Math.atan2(vecDiff.y, vecDiff.x);

            // mass
            const m1 = b1.m;  
            const m2 = b2.m;

            // grab initial vel
            const u1 = axisRotation(b1.vel, angle);
            const u2 = axisRotation(b2.vel, angle);

            // calculate the final velocity
            const v1 = { x:(((m1 - m2) * u1.x) / (m1 + m2)) + ((2 * m2) * u2.x) / (m1 + m2),
                y: u1.y};
            const v2 = {x:(((2 * m1)*u1.x) / (m1 + m2)) + (((m2 - m1) * u2.x) / (m1 + m2)), 
                y: u2.y};
            
            const finalVel1 = axisRotation(v1, -angle);
            const finalVel2 = axisRotation(v2, -angle);

            b1.vel = new Vector(finalVel1.x, finalVel1.y);
            b2.vel = new Vector(finalVel2.x, finalVel2.y);
        }
    }
}


/**
 * @description set of utility functions  for a moving object
 */
const Motion = {

    translateX: 0,
    translateY: 0,

    /**
     * 
     * @description move vectors linearly to a new position
     * @param {Vector} v1 vector to be move with a defined x, y
     * @param {Vector} v2 destination vector
     * @param {Number} speed speed at which the v1 travels
     * 
     */    
    moveTo(v1, v2, speed) {
        let newPos = new Vector(v2.x, v2.y)
        .subtract({x: v1.x, y: v1.y});
        let p = Vector.getPolarCoord(newPos.angle, speed);
        v1.x += p.x;
        v1.y += p.y;
    },


    /**
     * @description reverse the velocity of a vector by reference
     * @param {Vector} v vector with a defined velocity
     * @param {String} type direction of the velocity, x or y
     * 
     */
    reverseVel(v, type="x") {
        if(type.toLowerCase() === "x")
            v.vel.x = -v.vel.x;
        else if(type.toLowerCase() === "y")
            v.vel.y = -v.vel.y;
    },

    /**
     * @description decrease vector's velocity by friction
     * @param {Vector} v vector with a defined x, y
     * @param {Number} f amount of the friction
     * @param {String} type velocity direction where the friction should be applied
     * 
     */
    addFriction(v, f=0.8, type="y") {
        if(type.toLowerCase() === "x")
            v.vel.x *= f;
        else 
            v.vel.y *= f;
    },

    /**
     * @description increase vector's velocity by acceleration due to gravity
     * @param {Vector} v vector with a defined x, y
     * @param {Number} g acceleration due to gravity
     * 
     */
    addGravity(v, g=0) {
        v.vel.y += g;
    },

    /**
     * 
     * @description add accelaration to a vector
     * @param {Vector} v vector with a defined x,y
     * @param {Number} a acceleration's value
     * @param {String} type acceleration's direction
     * 
     */
    addAcceleration(v, a, type="x") {
        if(type.toLowerCase() === "x")
            v.vel.x += a;
        else 
            v.vel.y += a;
    },

    /**
     * @description moves a vector along a cubic bezier curve
     * @param {Component} l1 line component with a defined x0, y0, x1, y1
     * @param {Component} l2 line component with a defined x0, y0, x1, y1
     * @param {Number} t speed at which the vector moves 
     * 
     */
    moveToBezierCurve(l1, l2, t) {
        let cx = 3 * (l1.x1 - l1.x0);
        let bx = 3 * (l2.x0 - l1.x1) - cx;
        let ax = l2.x1 - l1.x0 - cx  - bx;
        let cy = 3 * (l1.y1 - l1.y0);
        let by = 3 * (l2.y0 - l1.y1) - cy;
        let ay = l2.y1 - l1.y0 - cy - by;
        let x = ax * (t*t*t) + bx*(t*t) + cx * t + l1.x0;
        let y = ay * (t*t*t) + by*(t * t) + cy * t + l1.y0;
        return {x, y};
    },

    /**
     * @description ease out vector's velocity with a given point
     * @param {Vector} v1 vector-origin with a defined x, y
     * @param {Vector} v2 vector-destination with a defined x, y
     * @param {Number} e easing value
     * 
     */
    easeOut(v1, v2, e) {
        let newPos = new Vector(v2.x, v2.y)
        .subtract({x: v1.x, y: v1.y});
        v1.vel.x = newPos.magnitude * e;
        v1.vel.y = newPos.magnitude * e;
        let p = Vector.getPolarCoord(newPos.angle, v1.vel.x);
        v1.x += p.x;
        v1.y += p.y;
    },

    /**
     * @description ease in vector's velocity with a given point
     * @param {Vector} v1 vector-origin with a defined x, y
     * @param {Vector} v2 vector-destination with a defined x, y
     * @param {Number} e easing value
     * 
     */
    easeIn(v1, v2, e) {
        let newPos = new Vector(v2.x, v2.y)
        .subtract({x: v1.x, y: v1.y});
        v1.vel.x += e;
        let p = Vector.getPolarCoord(newPos.angle, v1.vel.x);
        v1.x += p.x;
        v1.y += p.y;        
    },

    /**
     * @description translate vector's to a new position for transformation
     * @param {Number} x new position on the X-axis
     * @param {Number} y new position on the Y-axis
     * 
     */
    translate(x, y) {
        this.translateX = x;
        this.translateY = y;
    },

    /**
     * @description rotate vector's about a fixed origin
     * @param {Vector} v vector with a defined x, y
     * @param {Number} angle amount of angle's rotation
     * @param {Number} magnitude magnitude from the origin
     * 
     */
    rotate(v, angle=0, magnitude=0) {
        let pos = Vector.getPolarCoord(angle, magnitude);
        v.x = this.translateX + pos.x;
        v.y = this.translateY + pos.y;
    },

};


Math.__proto__ = {

    /**
     * 
     * @description Get random numbers within a specified range
     * @param {Number} min Minimum value's range
     * @param {Number} max Maximum value's range
     * @returns {Numer} Number between min and max
     * 
     */
    randRange(min=0, max=1) {
        return this.random() * (max - min + 1) + min;
    },

    /**
     * 
     * @description Get random items from an array
     * @param {Array} arr Array to get random items from.
     * @returns {Any} Random items from an array
     * 
     */
    randFromArray(arr) {
        return arr[this.random() * arr.length | 0];
    },

    /**
     * 
     * @description Converts a given number to radian
     * @param {Number} n Number to be converted into radian
     * @returns {Number} Argument in radian
     * 
     */
    toRadian(n) {
        return n * this.PI / 180;
    },

    /**
     * @description Converts a given number to degree
     * @param {Number} value Number to be converted into degree
     * @returns {Number} Argument in degree.
     */
    toDegree(value) {
        return value * 180 / this.PI;
    }

}


/**
 * @description gives a swipe gesture functionality to it's binded element
 */
class Swipe {

    /**
     * @constructor
     * @param {Object} element elements to add the listener to
     * 
     */
    constructor({element, type="default"}) {
        this.element = element;             
        this.direction = null;              // direction of the swipe
        this.isActive = false;              
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
                    if ("ontouchstart" in window)
                        this.touch();
                    else if("onmousedown" in window)
                        this.mouse();
                    break;
                default:
                    throw new Error(`Swipe of type "${type}" does not exist`);
            };
        } else {
            if ("ontouchstart" in window)
                this.touch();
            else if("onmousedown" in window)
                this.mouse();
        }
    }

    /**
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
            e.preventDefault();
        });

        this.element.addEventListener("touchend", () => {
            this.isActive = false;
            this.pos = new Vector(0, 0);
        });
    }

    /**
     * @description handles mouse swipe
     */
    mouse() {
        this.element.addEventListener("mousedown", e => {
            this.isActive = true;
            this.pos = new Vector(e.clientX, e.clientY);
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
            }
        });

        this.element.addEventListener("mouseup", () => {
            this.isActive = false;
            this.pos = new Vector(0, 0);
        });
    }
     
}


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


/**
* @description Component's Base class
*/
class Component extends Vector {
    /**
     * 
     * @param {Object} param0 component's base params
     */
    constructor({x=0, y=0, w=0, h=0, r=null, x0=null, y0=null, x1=null, y1=null}) {
        super(x, y);
        // polygons
        this.w = w;
        this.h = h;
        // circle
        this.r = r;
        // lines
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
        this.vel = new Vector(0, 0);
        this.s = 0;
        this.m = 5;     // mass
        this.type = this.x0 !== null ? "line" : this.r !== null ? "circle" : "polygon";
    }

    getCenterX() {
        if(this.type === "circle")  return this.x;
        return this.x + this.w * .5;
    }

    getCenterY() {
        if(this.type === "circle") return this.y;
        return this.y + this.h * .5;
    }
}


/**
 * @description principal class for a 2D Camera's object
 * 
 */
class Camera extends Vector {
    /**
     * @constructor
     * @param {Number} x starting position of the camera in the X-axis
     * @param {Number} y starting position of the camera in the Y-axis
     * @param {Number} w ending position of the camera in the X-axis
     * @param {Number} h ending position of the camera in the Y-axis
     * 
     */
    constructor(x = 0, y = 0, w = 0, h = 0) {
        super(x, y);
        this.w = w;
        this.h = h;

        // follow up camera mostly in a tiled base game's maximum and minimum location
        this.maxDimension = new Vector(0, 0);
    }

    follow(component) {
        if(this.maxDimension.y === 0 && this.maxDimension.x === 0)
            throw new Error("Please provide the maximum dimension for the camera");
        
       // get the camera position from the centre of the player
        let cameraPos = new Vector(component.getCenterX(),
                component.getCenterY()).subtract({
                x: this.w * .5, y: this.h * .5});
                    
        // set camera to the center of the player
        this.x = cameraPos.x;
        this.y = cameraPos.y;

        // stop moving the camera if it is less than 0 or greater than the mapSize on the X-axis
        this.x = Math.min(Math.max(0, this.x), Math.min(
            this.maxDimension.x - this.w, Math.max(0, cameraPos.x)));

        // stop moving the camera if it is less than 0 or greater than the mapSize on the Y-axis
        this.y = Math.min(Math.max(0, this.y), Math.min(
            this.maxDimension.y - this.h, Math.max(0, cameraPos.y)));
    }
}


/**
 * @description draw sprite on the canvas
 */
class Sprite extends Component {

    /**
     * @constructor
     * @param {Number} x position of the sprite on the X-axis
     * @param {Number} y position of the sprite on the Y-axis
     * @param {Number} w width of the sprite
     * @param {Number} h height of the sprite
     * @param {TileSet} data tileset containing tile's info relating with the sprite
     * @param {String} frame name of the animation frame
     * @param {Number} delay speed of the animation
     * 
     * */
    constructor(x, y, w, h, data, frame, delay=0) {
        super({x, y, w, h});
        this.data = data;   // TileSet Object

        this.img = this.data.img;
        this.tileW = this.data.w;
        this.tileH = this.data.h;
        this.spacing = this.data.spacing;
        
        this.frame = this.data.frame.filter(i => i.name === frame)[0];
        this.frameName = "";
        this.currentFrame = [];
        this.frameIndex = 0;
        
        for(const name in this.frame)
            this.setFrame(name);

        this.src = new Vector(undefined, undefined);
        
        this.delay = delay;
        this.maximumDelay = delay;
    }

    /**
     * @description change animation's frame for the sprite
     * @param {String} key The name of the frame
     * 
     */
    setFrame(key) {
        this.frameName = key;
        if(this.frame[key] === undefined) 
            throw new Error(`"${key}" is not a valid frame's name`);
        this.currentFrame = this.frame[key];
    }

    /**
     * @returns The name of the current frame
     */
    getFrame() {
        return this.frameName;
    }

    /**
     * @description get the source X and Y value for the current frame
     */
    animate() {
        if(this.currentFrame.length < 1 || !(this.currentFrame instanceof Array)) 
            throw new Error(`Current Animation's Frame does not exist`);

        this.delay--;
        if(this.delay < 0) {
            this.delay = this.maximumDelay;
            this.frameIndex++;
            if(this.frameIndex >= this.currentFrame.length)
                this.frameIndex = 0;
            let value = this.currentFrame[this.frameIndex] - 1;
            this.src = this.data.getIndex(value);
        }
    }

    draw(callback = null) {
        this.animate();
        if(typeof callback === "function") 
            callback();
        else 
            CURRENT_CONTEXT.drawImage(this.img, this.src.x * this.data.w, 
                this.src.y * this.data.h, this.data.w, this.data.h, this.x, 
                this.y, this.w, this.h);
    }

};


const TileMapCollision = {

    nextTile: [],
    nextTilePos: [],
    newPos: {x: null, y: null},

    /**
     * 
     * @param {Component} c A rectangular component
     * @param {String} type type of the component
     * @param {Object} param2 contains list of callback functions triggered on every collision's direction
     * 
     */
    checkCollision(c, type="rect", {left=null, right=null, 
        up=null, down=null, timeElapsed={x:1, y:1}}) {
        // let t1, t2;
        let obj, p1, p2, t1, t2;
        if(type === "rect") {
            obj = {
                x: c.x, y: c.y,
                w: c.w, h: c.h
            }
        } else {
            throw TypeError(`only rect to rect collision checking exists`);
        }

        let newPos = {
            x: c.x + c.vel.x * timeElapsed.x, 
            y: c.y + c.vel.y * timeElapsed.y
        };

        // horizontal boundary
        if(c.vel.x <= 0) {

            this.nextTilePos[0] = {x: newPos.x, y: obj.y};
            this.nextTilePos[1] = {x: newPos.x, y: obj.y + obj.h + 0.9 - 1};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.x = parseInt(newPos.x);
            if(typeof left === "function") left();
        } 
        else {

            this.nextTilePos[0] = {x: newPos.x + obj.w - 1, y: obj.y};
            this.nextTilePos[1] = {x: newPos.x + obj.w - 1, y: obj.y + obj.h + 0.9 - 1};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.x = parseInt(newPos.x);
            if(typeof right === "function") right();

        }

        // vertical boundary
        if(c.vel.y <= 0) {

            this.nextTilePos[0] = {x: newPos.x, y: newPos.y};
            this.nextTilePos[1] = {x: newPos.x + obj.w + 0.9 - 1, y: newPos.y};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.y = parseInt(newPos.y);
            if(typeof up === "function") up();
        } 
        else {

            this.nextTilePos[0] = {x: newPos.x, y: newPos.y + c.h - 1};
            this.nextTilePos[1] = {x: newPos.x + obj.w + 0.9 - 1, y: newPos.y + obj.h - 1};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.y = parseInt(newPos.y);
            if(typeof up === "function") up();
        }

    }

};


/**
 * 
 * @description setup for tiledMap creation
 * 
 */
class TileMap {

    /**
     * @constructor
     * @param {Object} param0 setup params for the tile
     * 
     */
    constructor({map=[0], w, h, camera, defs={default:0}}) {
        this.map = map;
        if(!(this.map instanceof Array) || this.map.length <= 0 || this.map[0][0].length <= 0)
            throw new Error("world map can only be respresented as a 2D Array");

        // tile
        this.w = w;
        this.h = h;

        this.mapSize = new Vector(this.map[0].length, this.map.length);      // How many columns and rows
        this.mapDimension = new Vector(this.w, this.h).multiply(this.mapSize);    // total size of rows and columns

        this.camera = camera || new Camera(0, 0, this.mapDimension.x, this.mapDimension.y);
        if(!(this.camera instanceof Camera)) {
            throw new Error("Failed to initialize camera: camera must be an instance of `Camera`");
        }
        this.camera.maxDimension = this.mapDimension;

        this.id = null;
        this.row = null;
        this.col = null;

        this.defs = defs;
    }

    set(map) {
        this.map = map;
    }

    /**
     * @description render tileMap to the canvas on a GO
     * @param {function} callback A function to customize the map rendering, you can
     * access the current mapId, mapRow and mapCol in this function
     * 
     */
    render(callback) {

        let x_min = ~~(this.camera.x / this.w);
        let y_min = ~~(this.camera.y / this.h);

        let x_max = Math.ceil((this.camera.x + this.camera.w) / this.w);
        let y_max = Math.ceil((this.camera.y + this.camera.h) / this.h);

        for(let r = y_min; r < y_max; r++) {
            for(let c = x_min; c < x_max; c++) {
                this.id = this.map[r][c];
                this.row = r;
                this.col = c;
                callback();
            }
        }

    }

    /**
     * 
     * @description returns the value at an integral index
     * @param {number} x pos of the Object in X-axis
     * @param {number} y pos of the Object in Y-axis
     * @returns the value corresponding to x and y on the map
     * 
     */
    getTile(v) {
        let pos = new Vector(~~(v.x / this.w), ~~(v.y / this.h));
        return this.map[pos.y][pos.x];
    }

    /**
     * 
     * @description accepts a vector as the first arguement and set the 
     * tile corresponding to the vector to the value in the second argument
     * @param {Vector} v vector with a defined x,y
     * @param {Any} value new value for the current tile
     * 
     */
    setTile(v, value) {
        let pos = {x: ~~(v.x / this.w), y: ~~(v.y / this.h)};
        this.map[pos.y][pos.x] = value;
    }

    /**
     * 
     * @description get the item value in a map def
     * @param {String} name name of the def items 
     * @returns {Object} value of the def item
     * 
     */
    getDefs(name) {
        if(this.defs[name] !== undefined)
            return this.defs[name];
        else 
            throw new Error(`"${name}" is not a valid defs name`);
    }

}


Object.assign(TileMap.prototype, TileMapCollision);


/**
 * @description creates Tileset
 */
class TileSet {
    /**
     * @constructor
     * @param {Object} param0 setup for the tileset
     * 
     */
    constructor({img=null, w=0, h=0, col=0, row=0, spacing=0, frame=[]}) {
        if(img !== null) {
            this.img = new Image();
            this.img.src = img;
        }
        this.w = w;
        this.h = h;
        this.col = col;
        this.row = row;
        this.spacing = spacing;
        // frame for sprite animation
        this.frame = frame;
    }

    /**
     * @description accepts a number and return it's 
     * corresponding x,y coordinates on the tile image
     * @param {Number} n value to get the index from
     * 
     */
    getIndex(n) {
        let x = ~~(n % this.col);
        let y = ~~(n / this.col);
        return new Vector(x, y);
    }

    /**
     * @description accpets a row/column number and 
     * return the value of their tile.
     * @param {Number} r row number
     * @param {Number} c column number
     * 
     */
    getTile(r, c) {
        return r * this.col + c;
    }
}


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
