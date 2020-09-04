/**
 * @description Vector 
 * 
 * diff(n) = n2 - (n1 || 0)
 * 
 * @param {number} x diff(X) of the vector
 * @param {number} y diff(Y) of the vector
 * 
 */
const Vector  = function(x, y) {
        this.x = x;
        this.y = y;
        this.magnitude = Math.hypot(this.x, this.y);
        this.angle = Math.atan2(this.y, this.x);
};


Vector.prototype = {
    
    // normalised the vector
    normalise() {
        let magnitude = this.magnitude();
        this.x /= magnitude;
        this.y /= magnitude;
    },

    /**
     * @description vector's addition
     * @param {number} vec The second vector to be added with this
     * @returns {Vector}
     */
    add(vec) {
        let x = this.x + vec.x;
        let y = this.y + vec.y;
        return new Vector(x, y);
    },

    /**
     * @description vector's subtraction
     * @param {number} vec The second vector to be subtracted from this
     * @returns {Vector}
     */
    subtract(vec) {
        let x = this.x - vec.x;
        let y = this.y - vec.y;
        return new Vector(x, y);
    },

    /**
     * @description vector - scalar multiplication
     * @param {number} scalar The scaling value
     * @returns {Vector}
     */
    multiply(vec) {
        let x = this.x * vec.x;
        let y = this.y * vec.y;
        return new Vector(x, y);
    },

    /**
     * @description vector's dot product : shows how much of this is being projected to the other vector
     * @param {number} vec The other vector to compared with
     * @returns {number}
     */
    dot(vec) {
        let x = this.x * vec.x;
        let y = this.y * vec.y;
        return x + y;
    },

    toString() {
        return `Vector's object with the component X and Y as ${this.x}, ${this.y} respectively`;
    }
    
};
