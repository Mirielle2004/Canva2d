/**
* @class Vector3
* Principal class for vector's manipulations
*/

class Vector3 {
    /**
     * @static createFrom
     * @description creates a vector from it's argument
     * @param {Object} arg Array or an Array-like to create a vector from
     * @returns {Vector3}
     */
    static createFrom(arg) {
        if(arg instanceof Vector3)
            return arg;
        else if(arg instanceof Array) {
            return new Vector3(arg[0], arg[1], arg[2], 1);
        }
        else if(arg instanceof Object) {
            return new Vector3(arg.x, arg.y, arg.z, 1);
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
        let diff = Vector3.createFrom(v2).sub(Vector3.createFrom(v1));
        return Math.hypot(diff.x, diff.y);
    }
    
    /**
     * @constructor
     * @param {Number} x x-component of the vector
     * @param {Number} y y-component of the vector
     * @param {Number} z z-component of the vector
     * @param {Number} w (optional) w-component for the vector
     */
    constructor(x=0, y=0, z=0, w=1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.o = {x:0, y:0, z:0, w:1};
        this.length = Math.hypot(this.x, this.y, this.z);
    }

    /**
     * @method add
     * @description add two vector's together
     * @param {Object} v vector to add with this
     * @returns {Vector3} a new vector 
     */
    add(vec) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * @method sub
     * @description subtracts a vector from this
     * @param {Object} v vector to be subtracted from this
     * @returns {Vector3} a new vector
     */
    sub(vec) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * @method scale
     * @description scales each components of a vector by a number
     * @param {Number} s scaling factor for this
     * @returns {Vector3} scaled version of this
     */
    scale(s) {
        return new Vec2d(this.x * s, this.y * s, this.z * s);
    }

    /**
     * @method addScale
     * @description adds a scaled vector to this
     * @param {Object} v a vector to be added to this
     * @param {Number} s a scaling factor to this
     * @returns {Vector3}
     */
    addScale(vec, s) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x + v.x * s, this.y + v.y * s, this.z + v.z * s);
    }

    /**
     * @method mult
     * @description multiply a vector by a vector
     * @param {Object} v vector to be multiplied with this
     * @returns {Vector3}
     */
    mult(vec) {
        let v = Vector3.createFrom(vec);
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    /**
     * @method dot
     * @description determine the dot product of this vector against the argument
     * @param {Object} v  vector to be tested against this
     * @returns {Number} how much this is similar to the other vector
     */
    dot(vec) {
        let v = Vector3.createFrom(vec);
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * @method cross
     * @description creates a vector perpendicular to this and the other vector
     * @param {Object} vec other vector
     * @returns {Vector3} vector perpendicular to this and the other vector
     */
    cross(vec) {
        let v = Vector3.createFrom(vec);
        let x = this.y * v.z - this.z * v.y;
        let y = this.z * v.x - this.x * v.z;
        let z = this.x * v.y - this.y * v.x;
        return new Vector3(x, y, z);
    }

    /**
     * @method angleBetween
     * @description get the angle between two vectors
     * @param {Object} vec second vector
     * @return {Number} angle between this and other vector in radian
     */
    angleBetween(vec) {
        let v = Vector3.createFrom(vec);
        return this.dot(v)/(this.length * v.length);
    }

    /**
     * @method getDist
     * @description get the distance between this and other vector
     * @param {Object} v positional vector 
     * @returns {Number} distance between two points
     */
    getDist(v) {
        let diff = Vector3.createFrom(v).sub(this);
        return Math.hypot(diff.x, diff.y, diff.z);
    }

    /**
     * @method inverse
     * @description get the inverse of the each component in this vector
     * @returns {Vector3} 
     */
    inverse() {
        return new Vector3(1/this.x, 1/this.y, 1/this.z)
    }

    /**
     * @method normalise
     * @description get the unit vector of this
     */
    normalise() {
        if(this.length !== 0) 
            return this.scale(1/this.length);
        else 
            return new Vector3();
    }

    applyFunc(func) {
        return new Vector3(func(this.x), func(this.y), func(this.z));
    }

    /**
     * @method useNMC
     * @description use normalised coordinate
     * @param vec origin vector 
     * @returns vector in a normalised coordinate
     */
    useNMC(vec) {
        let v = Vector3.createFrom(vec);
        this.x += 1;
        this.y += 1;
        this.x *= v.x;
        this.y *= v.y;
        return new Vector3(this.x, this.y, this.z, this.w);
    }

    /**
     * @method clone
     * @description create a copy of this
     * @returns {Vector3} clone of this
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * @method toArray
     * @description creates an array with each components of this vector
     * @returns {Array} containing components of this vectors
     */
    toArray() {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * @method toObject
     * @description creates an object with each components of this vector
     * @returns {Object} containing key/value components of this vector respectively
     */
    toObject() {
        return {x: this.x, y:this.y, z:this.z, w:this.w};
    }

    draw(ctx, o, stroke, width) {
        let vo = Vector3.createFrom(o);
        ctx.save();
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(vo.x, vo.y);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = stroke;
        ctx.stroke();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.scale(1,1);
        ctx.arc(0, 0, 3, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = stroke;
        ctx.fill();
        ctx.restore();
    }
};