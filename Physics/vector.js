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
