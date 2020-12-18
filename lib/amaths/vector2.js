;{
    /**
    * @class Vector2
    * Principal class for vector's manipulations
    */
    class Vector2 {

        /**
         * @constructor 
         * @description a 2d-vector's could be created using any of the following 
         * constructors 
         * Vector2([1,2]) || Vector2(1, 2) || Vector2(1)
         * @param {Any} arg1 first argument
         * @param {Any} arg2 second argument
         */
        constructor(arg1, arg2) {
            if(arguments.length === 0) {
                this.x = 0;
                this.y = 0;
            } else if(arguments.length === 1) {
                if(arg1 instanceof Array)  {
                    this.x = arg1[0];
                    this.y = arg1[1] || 0;
                } else if(arg1 instanceof Object && ["x", 'y']
                .some(key => arg1.hasOwnProperty(key))) {
                    this.x = arg1["x"];
                    this.y = arg1["y"];
                } else {
                    this.x = arg1;
                    this.y = arg1;
                }
            } else {
                this.x = arg1;
                this.y = arg2;
            }
            this.w = 1;
        }

        // get the angle formed by this vector
        get angle() {
            return Math.atan2(this.y, this.x);
        }

        // get the magnitude of this vector
        get length() {
            return Math.hypot(this.x, this.y);
        }

        /**
         * @method add
         * @description add two vector's together
         * @param {Object} vector vector to add with this
         * @returns {Vector2} a new vector 
         */
        add(vector) {
            let v = new Vector2(vector);
            return new Vector2(this.x + v.x, this.y + v.y);
        }

        /**
         * @method sub
         * @description subtracts a vector from this
         * @param {Object} vector vector to be subtracted from this
         * @returns {Vector2} a new vector
         */
        sub(vector) {
            let v = new Vector2(vector);
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
         * @param {Object} vector a vector to be added to this
         * @param {Number} s a scaling factor to this
         * @returns {Vector2}
         */
        addScale(vector, s) {
            let v = new Vector2(vector);
            return new Vector2(this.x + v.x * s, this.y + v.y * s);
        }

        /**
         * @method mult
         * @description multiply a vector by a vector
         * @param {Object} vector vector to be multiplied with this
         * @returns {Vector2}
         */
        mult(vector) {
            let v = new Vector2(vector);
            return new Vector2(this.x * v.x, this.y * v.y);
        }

        /**
         * @method dot
         * @description determine the dot product of this vector against the argument
         * @param {Object} vector  vector to be tested against this
         * @returns {Number} how much this is similar to the other vector
         */
        dot(vector) {
            let v = new Vector2(vector);
            return this.x * v.x + this.y * v.y;
        }

        cross() {
            return [
                new Vector2(-this.y, this.x),
                new Vector2(this.y, -this.x)
            ];
        }

        /**
         * @method angleBetween
         * @description finds the angle between two vectors
         * @param {Vector2} vector second vector
         */
        angleBetween(vector) {
            let v = new Vector2(vector);
            return this.dot(v)/(this.length * v.length);
        }

        /**
         * @method getDist
         * @description get the distance between this and other vector
         * @param {Object} vector positional vector 
         * @returns {Number} distance between two points
         */
        getDist(vector) {
            let diff = new Vector2(vector).sub(this);
            return diff.length;
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
            if(this.length !== 0) {
                let x = this.x / this.length;
                let y = this.y / this.length;
                return new Vector2(x, y);
            } else return new Vector2();
        }

        /**
         * @method applyFunc
         * @description apply a function to each component of the vector
         * @param {Function} func function to be applied
         */
        applyFunc(func1, func2) {
            if(arguments.length === 1)
                return new Vector2(func1(this.x), func1(this.y));
            else 
                return new Vector2(func1(this.x), func2(this.y));
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
        toArray(length = 3) {
            let arr = [this.x, this.y, this.w];
            return arr.splice(0, Math.min(3, length));
        }

        /**
         * @method toObject
         * @description creates an object with each components of this vector
         * @returns {Object} containing key/value components of this vector respectively
         */
        toObject() {
            return {x: this.x, y:this.y};
        }

        toString() {
            return `Vector2 object (x:${this.x}, y:${this.y})`;
        }
        
    };

    Object.defineProperty(Canva2D.API, "Vector2", {value: Vector2});

};