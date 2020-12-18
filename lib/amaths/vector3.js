;{
    /**
    * @class Vector3
    * Principal class for vector's manipulations
    */

    class Vector3 {
        
        /**
         * @constructor
         * @param {Number} x x-component of the vector
         * @param {Number} y y-component of the vector
         * @param {Number} z z-component of the vector
         * @param {Number} w (optional) w-component for the vector
         */
        constructor(arg1, arg2, arg3) {
            if(arguments.length === 0) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
            } else if(arguments.length === 1) {
                if(arg1 instanceof Array)  {
                    this.x = arg1[0] === undefined ? 0 : arg1[0];
                    this.y = arg1[1] === undefined ? 0 : arg1[1];
                    this.z = arg1[2] === undefined ? 0 : arg1[2];
                } else if(arg1 instanceof Object && ["x", 'y', 'z']
                .some(key => arg1.hasOwnProperty(key))) {
                    this.x = arg1["x"] === undefined ? 0 : arg1["x"];
                    this.y = arg1["y"] === undefined ? 0 : arg1["y"];
                    this.z = arg1["z"] === undefined ? 0 : arg1["z"];
                } else {
                    this.x = arg1;
                    this.y = arg1;
                    this.z = arg1;
                }
            } else {
                if(arg1 !== undefined && typeof arg1 === "number")
                    this.x = arg1 || 0;
                else throw new Error("Failed to Initialise Vector: Insufficient Data");
                if(arg2 !== undefined && typeof arg2 === "number")
                    this.y = arg2 || 0;
                else throw new Error("Failed to Initialise Vector: Insufficient Data");
                if(arg3 !== undefined && typeof arg3 === "number")
                    this.z = arg3 || 0;
                else throw new Error("Failed to Initialise Vector: Insufficient Data");
            }
            this.w = 1;
            this.o = {x:this.x, y:this.y, z:this.z, w:1};
            this.length = Math.hypot(this.x, this.y, this.z);
        }

        /**
         * @method add
         * @description add two vector's together
         * @param {Object} vector vector to add with this
         * @returns {Vector3} a new vector 
         */
        add(vector) {
            let v = new Vector3(vector);
            return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        }

        /**
         * @method sub
         * @description subtracts a vector from this
         * @param {Object} vector vector to be subtracted from this
         * @returns {Vector3} a new vector
         */
        sub(vector) {
            let v = new Vector3(vector);
            return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        }

        /**
         * @method scale
         * @description scales each components of a vector by a number
         * @param {Number} s scaling factor for this
         * @returns {Vector3} scaled version of this
         */
        scale(s) {
            return new Vector2(this.x * s, this.y * s, this.z * s);
        }

        /**
         * @method addScale
         * @description adds a scaled vector to this
         * @param {Object} vector a vector to be added to this
         * @param {Number} s a scaling factor to this
         * @returns {Vector3}
         */
        addScale(vector, s) {
            let v = new Vector3(vector);
            return new Vector3(this.x + v.x * s, this.y + v.y * s, this.z + v.z * s);
        }

        /**
         * @method mult
         * @description multiply a vector by a vector
         * @param {Object} vector vector to be multiplied with this
         * @returns {Vector3}
         */
        mult(vector) {
            let v = new Vector3(vector);
            return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
        }

        /**
         * @method dot
         * @description determine the dot product of this vector against the argument
         * @param {Object} vector vector to be tested against this
         * @returns {Number} how much this is similar to the other vector
         */
        dot(vector) {
            let v = new Vector3(vector);
            return this.x * v.x + this.y * v.y + this.z * v.z;
        }

        /**
         * @method cross
         * @description creates a vector perpendicular to this and the other vector
         * @param {Object} vector other vector
         * @returns {Vector3} vector perpendicular to this and the other vector
         */
        cross(vector) {
            let v = new Vector3(vector);
            let x = this.y * v.z - this.z * v.y;
            let y = this.z * v.x - this.x * v.z;
            let z = this.x * v.y - this.y * v.x;
            return new Vector3(x, y, z);
        }

        /**
         * @method angleBetween
         * @description get the angle between two vectors
         * @param {Object} vector second vector
         * @return {Number} angle between this and other vector in radian
         */
        angleBetween(vector) {
            let v = new Vector3(vector);
            return this.dot(v)/(this.length * v.length);
        }

        /**
         * @method getDist
         * @description get the distance between this and other vector
         * @param {Object} vector positional vector 
         * @returns {Number} distance between two points
         */
        getDist(vector) {
            let diff = new Vector3(vector).sub(this);
            return diff.length;
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
            if(this.length !== 0) {
                let x = this.x / this.length;
                let y = this.y / this.length;
                let z = this.z / this.length;
                return new Vector3(x, y, z);
            } else return new Vector3();
        }

        applyFunc(func) {
            if(arguments.length > 1) 
                throw new Error("This function expects a single argument");
            return new Vector3(func(this.x), func(this.y), func(this.z));
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
        toArray(length=4) {
            let arr = [this.x, this.y, this.z, this.w];
            return arr.splice(0, Math.min(4, length));
        }

        /**
         * @method toObject
         * @description creates an object with each components of this vector
         * @returns {Object} containing key/value components of this vector respectively
         */
        toObject() {
            return {x: this.x, y:this.y, z:this.z};
        }

        toString() {
            return `Vector2 object (x:${this.x}, y:${this.y}, z:${this.z})`;
        }
        
    };

    Object.defineProperty(Canva2D.API, "Vector3", {value: Vector3});
};