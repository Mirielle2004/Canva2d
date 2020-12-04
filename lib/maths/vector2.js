/**
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
}