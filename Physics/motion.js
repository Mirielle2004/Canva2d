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
