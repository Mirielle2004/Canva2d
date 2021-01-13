/**
 * 
 * @author Mirielle S.
 * @name: Canva2D.js
 * @description A simple HTML5 Canvas game Engine
 * Last Revision: 12th Jan. 2020
 * 
 * 
 * MIT License 
 * Copyright (c) 2020 CodeBreaker
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
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
 * for /r "c:\javascripts" %F in (*.js) do @type "%F" >>canva2d.js
 * code --disble-gpu
 */


const Canva2D = (function() {

    return {
        API: {
            get author() {return "CodeBreaker Inc."},
            get date() {return "10th Jan. 2021"},
            get version() {return "v0.0.15-alpha"}
        },
        getAPI() {
            return this.API;
        }
    };

})();// contain Constants  
Object.defineProperties(Canva2D.API, {
    
    TOUCH: {value: "for_touch_based_devices"},
    MOUSE: { value: "for_mouse_based_devices"},
    DEFAULT: {value: "use_default"}, 
    
    MAP_CONSTRUCTOR: {value: "create a tilemMap"},
    STATIC_FUNCTIONS: {value: "get functions from a map"},

    ORTHORGONAL: { value: "right_angle_to_each_other"},
    ISOMETRIC: { value: "isometric_angle_to_each_other"},

    /**
     * Manipulate the console
     * call - Canva2D.API.CONSOLE("type", "message")
     */
    CONSOLE: {value: (key, message) => {
        if(window.console === undefined) 
            return ;
        if(typeof window.console[key] === "function")
            window.console[key](message);
        else window.console.warn(`console.${key}(...arg) is undefined`);
    }}


});; {

    const createException = ((name, message) => {
        class NewException extends Error {
            constructor(message) {
                super(message);
                this.name = name;
            }
        };
        return new NewException(message);
    });

    // exception thrown when tilemap have no defined draw function
    Canva2D.API.mapRenderingError = createException("MapRenderingError", 
        "this.draw function could not be found");

    // exception thrown when tilemap instance creation failed
    Canva2D.API.tileMapError = createException("TileMapError", 
        "Failed to create TileMap");

    // exception thrown when camera instance creation failed
    Canva2D.API.cameraError = createException("CameraError", 
        "Failed to create Camera");


};{

    /**
    * @todo
    * inverse
    **/
    class Mat3x3 {

        static makeIdentity(i=1, w=1) {
            return new Mat3x3(
                i, 0, 0, 
                0, i, 0,
                0, 0, w,
            );
        }

        /**
        * @static rotate
        * @description rotation matrix
        * @param {Number} angle rotated angle
        * @return {Mat3x3}
        */
        static makeRotate(angle=0) {
            return new Mat3x3(
                Math.cos(angle), Math.sin(angle), 0, 
                -Math.sin(angle), Math.cos(angle), 0, 
                0, 0, 1
            );
        }

        /**
         * @constructor
         * @param {Number} items matrix data
         */
        constructor(...items) {
            this.items = items.length < 1 ? new Array(9).fill(0) : items;
            const MAX_LENGTH = 3 * 3;
            if(this.items.length !== MAX_LENGTH)
                throw new Error("Failed to Initialise Mat3x3: Insufficient data");

            this._mult2DArray = [];
            for(let i=0; i < 3; i++) {
                this._mult2DArray.push([]);
                for(let j=0; j < 3; j++) {
                    this._mult2DArray[i][j] = this.items[i * 3 + j];
                }
            }
        }

        /**
         * @method getItem
         * @description retrieve an item from this matrix using row X column mapping
         * @param {Number} column column to retrieve the value from
         * @param {Number} row row to retrieve the value from
         * @return {Number} item at row * column
         */
        getItem(column, row)  {
            return this.items[row * 3 + column];
        }

        /**
         * @method setItem
         * @description set an item from this matrix using row X column mapping
         * @param {Number} column column to retrieve the value from
         * @param {Number} row row to retrieve the value from
         * @param {Number} value new value
         */
        setItem(column, row, value=0) {
            this.items[row * 3 + column] = value;
        }

        /**
         * @method multiplyVec
         * @description multiply a matrix by a vector
         * @param {Array} vec vector's data as an array
         * @returns {Array}
         */
        multiplyVec(vec) {
            let res = [];
            let tmp = 0;
            let matData = this._mult2DArray;
            let vecData = vec;
            for(let r=0; r < matData.length; r++) {
                tmp = 0;
                for(let j=0; j < matData.length; j++) {
                    let prod = vecData[j] * matData[j][r];
                    tmp += prod;
                }
                res.push(tmp);
            }
            return res;
        }

        /**
         * @method add
         * @description addition of matrices
         * @param {Mat3x3} mat a matrix
         * @returns {Mat3x3}
         */
        add(mat) {
            if(!(mat instanceof Mat3x3))
                throw TypeError("unexpected Argument: Must be an instance of a Mat3x3");
            let items = this.items.map((item, index) => item + mat.items[index]);
            return new Mat3x3(...items);
        }

        /**
         * @method sub
         * @description subtraction of matrices
         * @param {Mat3x3} mat a matrix
         * @returns {Mat3x3}
         */
        sub(mat) {
            if(!(mat instanceof Mat3x3))
                throw TypeError("unexpected Argument: Must be an instance of a Mat3x3");
            let items = this.items.map((item, index) => item - mat.items[index]);
            return new Mat3x3(...items);
        }

        mult(m) {
            if(!(m instanceof Mat3x3))
                throw TypeError("unexpected Argument: Must be an instance of a Mat3x3");
            let m1 = this.items;
            let m2 = m.items;
            let res = [];
            let sum;
            for(let i=0; i < 3; i++) {
                res.push([]);
                for(let j=0; j < 3; j++) {
                    sum = 0;
                    for(let k=0; k < 3; k++) {
                        let dot = this.getItem(k, i) * m.getItem(j, k);
                        sum += dot;
                    }
                    res[i].push(sum);
                }
            };
            return new Mat3x3(...res.flat());
        }

        /**
         * @method determinant
         * @description find the determinant of a matrix
         * @returns {Number} the determinant of a matrix
         */
        determinant() {
            this.data = this._mult2DArray;
            let a = this.data[0][0] * (this.data[1][1] * this.data[2][2] - this.data[1][2] * this.data[2][1]);
            let b = this.data[0][1] * (this.data[1][0] * this.data[2][2] - this.data[1][2] * this.data[2][0]);
            let c = this.data[0][2] * (this.data[1][0] * this.data[2][1] - this.data[1][1] * this.data[2][0]);
            return a - b + c;
        }

        /**
         * @method scale
         * @description scalar multiplication
         * @param {Number} scalar a scalar
         * @returns {Mat3x3}
         */
        scale(scalar=1) {
            let items = this.items.map(i => i * scalar);
            return new Mat3x3(...items);
        }

        /**
         * @method transpose
         * @description transpose a n * m matrix to m * n matrix
         * @returns {Mat3x3} the transpose of a matrix
         */
        transpose() {
            let mat2d = this._mult2DArray;
            let data = [
                mat2d[0][0],  mat2d[1][0], mat2d[2][0],
                mat2d[0][1],  mat2d[1][1], mat2d[2][1],
                mat2d[0][2],  mat2d[1][2], mat2d[2][2],
                mat2d[0][3],  mat2d[1][3], mat2d[2][3],
            ];
            return new Mat3x3(...data);
        }

        toString() {
            return `${this._mult2DArray[0]}\n${this._mult2DArray[1]}
    ${this._mult2DArray[2]}\n`;
        }
        
    };

    Object.defineProperty(Canva2D.API, "Mat3x3", {value: Mat3x3});

};;{
    /**
    * @todo
    * add inverse, mult
    * --- REMOVE DEPENDENCIES --- 
    * Vector3
    **/
    class Mat4x4 {

        static makeIdentity(i=1, w=1) {
            return new Mat4x4(
                i, 0, 0, 0, 
                0, i, 0, 0,
                0, 0, i, 0,
                0, 0, 0, w,
            );
        }

        static makeRotateX(a=0) {
            return new Mat4x4(
                1, 0, 0, 0, 
                0, Math.cos(a), Math.sin(a), 0, 
                0, -Math.sin(a), Math.cos(a), 0, 
                0, 0, 0, 1
            );
        }

        static makeRotateY(a=0) {
            return new Mat4x4(
                Math.cos(a), 0, Math.sin(a), 0, 
                0, 1, 0, 0, 
                -Math.sin(a), 0, Math.cos(a), 0, 
                0, 0, 0, 1
            );
        }

        static makeRotateZ(a=0) {
            return new Mat4x4(
                Math.cos(a), Math.sin(a), 0, 0, 
                -Math.sin(a), Math.cos(a), 0, 0,
                0, 0, 1, 0, 
                0, 0, 0, 1
            );
        }

        static setPerspective(aspectRatio=innerHeight/innerWidth, FOV=90, 
            zFar=0.1, zNear=100) {
                // let q = 
                return new Mat4x4(
                    FOV * aspectRatio, 0, 0, 0, 
                    0, FOV, 0, 0, 
                    0, 0, zFar, 1, 
                    0, 0, 0, 1
                );  
        }

        static setView(pos, target, up) {
            let _pos = Vector3.createFrom(pos);
            let _target = Vector3.createFrom(target);
            let _up = Vector3.createFrom(up);
            let newForward = _target.sub(_pos);
            newForward.normalise();
            let a = newForward.scale(_up.dot(newForward));
            let newUp = _up.sub(a);
            newUp.normalise();
            let newRight = newUp.cross(newForward);
            newRight.normalise();
            let pointAt =  new Mat4x4(
                newRight.x, newRight.y, newRight.z, 0, 
                newUp.x, newUp.y, newUp.z, 0, 
                newForward.x, newForward.y, newForward.z, 0, 
                pos.x, pos.y, pos.z, 1
            );
            let lookAt = new Mat4x4(
                newRight.x, newUp.x, newForward.x, 0,
                newRight.y, newUp.y, newForward.y, 0,
                newRight.z, newUp.z, newForward.z, 0,
                -pos.dot(newRight), -pos.dot(newUp), -pos.dot(newForward), 1
            );
            return lookAt;
        }

        /**
         * @constructor
         * @param {Number} items matrix data
         */
        constructor(...items) {
            this.items = items.length < 1 ? new Array(16).fill(0) : items;
            const MAX_LENGTH = 4 * 4;
            if(this.items.length !== MAX_LENGTH)
                throw new Error("Failed to Initialise Mat4x4: Insufficient data");

            this._mult2DArray = [];
            for(let i=0; i < 4; i++) {
                this._mult2DArray.push([]);
                for(let j=0; j < 4; j++) {
                    this._mult2DArray[i][j] = this.items[i * 4 + j];
                }
            }
        }

        /**
         * @method getItem
         * @description retrieve an item from this matrix using row X column mapping
         * @param {Number} column column to retrieve the value from
         * @param {Number} row row to retrieve the value from
         * @return {Number} item at row * column
         */
        getItem(column, row)  {
            return this.items[row * 4 + column];
        }

        /**
         * @method setItem
         * @description set an item from this matrix using row X column mapping
         * @param {Number} column column to retrieve the value from
         * @param {Number} row row to retrieve the value from
         * @param {Number} value new value
         */
        setItem(column, row, value=0) {
            this.items[row * 4 + column] = value;
        }

        /**
         * @method multiplyVec
         * @description multiply a matrix by a vector
         * @param {Array} vec vector's data as an array
         * @returns {Array}
         */
        multiplyVec(vec) {
            let res = [];
            let tmp = 0;
            let matData = this._mult2DArray;
            let vecData = vec;
            for(let r=0; r < matData.length; r++) {
                tmp = 0;
                for(let j=0; j < matData.length; j++) {
                    let prod = vecData[j] * matData[j][r];
                    tmp += prod;
                }
                res.push(tmp);
            }
            return res;
        }

        /**
         * @method add
         * @description addition of matrices
         * @param {Mat4x4} mat a matrix
         * @returns {Mat4x4}
         */
        add(mat) {
            if(!(mat instanceof Mat4x4))
                throw TypeError("unexpected Argument: Must be an instance of a Mat4x4");
            let items = this.items.map((item, index) => item + mat.items[index]);
            return new Mat4x4(...items);
        }

        /**
         * @method sub
         * @description subtraction of matrices
         * @param {Mat4x4} mat a matrix
         * @returns {Mat4x4}
         */
        sub(mat) {
            if(!(mat instanceof Mat4x4))
                throw TypeError("unexpected Argument: Must be an instance of a Mat4x4");
            let items = this.items.map((item, index) => item - mat.items[index]);
            return new Mat4x4(...items);
        }

        mult(m) {
            if(!(m instanceof Mat4x4))
                throw TypeError("unexpected Argument: Must be an instance of a Mat3x3");
            let m1 = this.items;
            let m2 = m.items;
            let res = [];
            let sum;
            for(let i=0; i < 4; i++) {
                res.push([]);
                for(let j=0; j < 4; j++) {
                    sum = 0;
                    for(let k=0; k < 4; k++) {
                        let dot = this.getItem(k, i) * m.getItem(j, k);
                        sum += dot;
                    }
                    res[i].push(sum);
                }
            };
            return new Mat4x4(...res.flat());
        }

        /**
         * @method determinant
         * @description find the determinant of a matrix
         * @returns {Number} the determinant of a matrix
         */
        determinant() { 
            this.data = this._mult2DArray;
            let a = this.data[0][0] * (this.data[1][1] * (this.data[2][2] * this.data[3][3] - this.data[2][3] * this.data[3][2]));
            let b = this.data[0][1] * (this.data[1][0] * (this.data[2][2] * this.data[3][3] - this.data[2][3] * this.data[3][2]));
            let c = this.data[0][2] * (this.data[1][0] * (this.data[2][1] * this.data[3][3] - this.data[2][3] * this.data[3][1]));
            let d = this.data[0][3] * (this.data[1][0] * (this.data[2][1] * this.data[3][2] - this.data[2][2] * this.data[3][1]));
            return a - b + c - d;
        }

        /**
         * @method scale
         * @description scalar multiplication
         * @param {Number} scalar a scalar
         * @returns {Mat4x4}
         */
        scale(scalar=1) {
            let items = this.items.map(i => i * scalar);
            return new Mat4x4(...items);
        }

        /**
         * @method transpose
         * @description transpose a n * m matrix to m * n matrix
         * @returns {Mat4x4} the transpose of a matrix
         */
        transpose() {
            let mat2d = this._mult2DArray;
            let data = [
                mat2d[0][0],  mat2d[1][0], mat2d[2][0], mat2d[3][0],
                mat2d[0][1],  mat2d[1][1], mat2d[2][1], mat2d[3][1],
                mat2d[0][2],  mat2d[1][2], mat2d[2][2], mat2d[3][2],
                mat2d[0][3],  mat2d[1][3], mat2d[2][3], mat2d[3][3],
            ];
            return new Mat4x4(...data);
        }

        toString() {
            return `${this._mult2DArray[0]}\n${this._mult2DArray[1]}
    ${this._mult2DArray[2]}\n${this._mult2DArray[3]}`;
        }

    };

    Object.defineProperty(Canva2D.API, "Mat4x4", {value: Mat4x4});
};;{
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

};;{
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
};; {

    const {ORTHORGONAL, ISOMETRIC, Vector2, cameraError} = Canva2D.API;

    const camera = (function(type, pos, dimension) {
        let API = {};
        switch(type) {
            case ORTHORGONAL:
                // do something;
                break;
            case ISOMETRIC:
                // do something
                break;
            default:
                throw cameraError;
        };

        API.pos = new Vector2(pos);
        API.dimension = new Vector2(dimension);
        API.lookAt = (map, tileSize) => {
            let _map;
            if(map.array === undefined)  {
                if(!(map instanceof Array)) {
                    cameraError.message = "Lookat object must be an instance of a tileMap or an array";
                    throw cameraError;
                }
            };
            API.map = map;
        };
        API.getView = function() {
            // let x_min = API.pos.scale()
        };

        return API;

    });

    Object.defineProperty(Canva2D.API, "Camera", {value: camera});
};{
    let Vector2 = Canva2D.API.Vector2;

    Canva2D.API.Component = {

        Shape: function(type, pos, dimension) {
            return new ShapeComponent(type, pos, dimension);
        },
    
        Basic: function(type, pos, dimension) {
            return new ShapeComponent(type, pos, dimension);
        },
        
        Sprite: function(frames, col, delay=5) {
            return new SpriteComponent(frames, col, delay);
        },
        
        Tile: function(pos, dimension) {
            return new TileComponent(pos, dimension);
        }
    };


    // SHAPE COMPONENT
    class ShapeComponent {

        constructor(type, pos, dimension) {
            this.validTypes = [
                "rect", 
                "circle",
                "line",
                "polygon"
            ];
            if(!(this.validTypes.some(i => i === type)))
                throw TypeError(`Failed to create Component, valid type 
                    must be from ${this.validTypes}`);
            this.type = type;
    
            if(this.type === "rect") {
                this.pos = new Vector2(pos);
                this.dimension = new Vector2(dimension);
            } 
            else if(this.type === "circle") {
                this.pos = new Vector2(pos);
                this.r = dimension;
            } 
            else if(this.type === "line") {
                this.start = new Vector2(pos);
                this.end = new Vector2(dimension);
            } 
            else if(this.type === "polygon") {
                this.pos = new Vector2(pos);
                this.vertices = [];
                if(dimension instanceof Array) {
                    if(dimension[0][0] !== undefined) {
                        dimension.forEach(data => {
                            this.vertices.push(new Vector2(data));
                        });
                    }
                }
            }
            
        }
    } // basic component ends



    class SpriteComponent {
        /**
         * @constructor
         * @param {Object} frames object contain animation frames data array
         * @param {Number} col number of columns in the spritesheet
         * @param {Number} delay animation delay
        */
        constructor(frames, col, delay=5) {
            this.col = col;
            this.frames = frames;
            this.currentFrames = [];
            this.frameName = null;
            for(const i in this.frames) {
                this.setFrame(i);
                break;
            }
            this.delay = delay;
            this.index = new Vector2();
            this._delayCounter = 0;
            this._frameCounter = 0;
            this.done = false;
            this.paused = false;
        }

        /**
         * @method setFrame
         * @description sets the current animation's frame
         * @param {String} frameName animation's frame name
         */
        setFrame(frameName) {
            if(this.frames.hasOwnProperty(frameName)) {
                if(this.frames[frameName] instanceof Array) {
                    this.currentFrames = this.frames[frameName];
                    this.frameName = frameName;
                } else 
                    throw TypeError("Sprite's current frame must be an instance of an Array");
            }
            else 
                throw new Error(`Sprite Frame name does not exists`);
        }
    
        /**
         * @method getTextureIndex
         * @description gets the source vectors for the animation. This 
         * method must be called in a loop for an effective animation
         */
        getTextureIndex() {
            if(!this.paused) {
                this._delayCounter++;
                if(this._delayCounter > this.delay) {
                    this._delayCounter = 0;
                    this._frameCounter++;
                    if(this._frameCounter >= this.currentFrames.length) {
                        this.done = false;
                        this._frameCounter = 0;
                    } else {
                        this.done = true;
                    }
                    let value = this.currentFrames[this._frameCounter] - 1;
                    let x = value % this.col;
                    let y = value / this.col;
                    this.index = new Vector2(~~x, ~~y);
                }    
            } else {
                let value = this.currentFrames[0];
                this.index = new Vector2(~~(value % this.col), ~~(value / this.col));
            }
        }
    } // sprite component ends



    class TileComponent {
    
        constructor(pos, dimension) {
            this.pos = new Vector2(pos);
            this.dimension = new Vector2(dimension);
            
            this._cBoundary = {
                pos: {x:0, y:0},
                dimension: this.dimension
            };
            
            this.lastPos = null;
            this.nextPos = null;
            this.currentPos = null;
            
            this._minPos = null;
            this._maxPos = null;
        }
        
        checkCollision(map, velocity, {left=null, top=null}) {
            // X-axis
            this.lastPos = this.pos;
            this.nextPos = new Vector2({
                x: this.lastPos.x + velocity.x,
                y: this.lastPos.y 
            });
            
            this._minPos = this.nextPos.mult(map.size.inverse()).applyFunc(Math.floor);
            this._maxPos = this.nextPos.add(this._cBoundary.dimension).mult(map.size.inverse()).applyFunc(Math.ceil);
            
            for(let r=this._minPos.y; r < this._maxPos.y; r++) {
                for(let c=this._minPos.x; c < this._maxPos.x; c++) {
                    this.currentPos = map.getId([c, r]);
                    if(typeof left === "function") left();
                }   
            }
            
            this.pos.x = this.nextPos.x;
            
            // Y-axis
            this.lastPos = this.pos;
            this.nextPos = new Vector2({
                x: this.lastPos.x,
                y: this.lastPos.y + velocity.y 
            });
            
            this._minPos = this.nextPos.mult(map.size.inverse()).applyFunc(Math.floor);
            this._maxPos = this.nextPos.add(this._cBoundary.dimension).mult(map.size.inverse()).applyFunc(Math.ceil);
            
            for(let r=this._minPos.y; r < this._maxPos.y; r++) {
                for(let c=this._minPos.x; c < this._maxPos.x; c++) {
                    this.currentPos = map.getId([c, r]);
                    if(typeof top === "function") top();
                }   
            }
            
            this.pos.y = this.nextPos.y;
            
        }
        
    } // tile component


}{
    Canva2D.API.PhysicsDecorator = function(object, values) {
        if(!object.initPhysicsDecorator) 
            object.initPhysicsDecorator = false;
        let params = [
            "velocity",
            "mass",
            "rotation",
            "force",
            "friction",
            "gravity",
            "speed",
            "acceleration"
        ];
        let res = {};
        params.forEach(p => res[p] = null);
        if(!object.initPhysicsDecorator) {
            for(const key in values) {
                if(res[key] !== undefined) {
                    res[key] = values[key];
                } else {
                    console.warn(`Invalid Physics Key Rejected: "${key}"`);
                }
            }
            Object.setPrototypeOf(object, res);
            object.initPhysicsDecorator = true;
        } else {
            throw new Error("Fail to add new Physics decorator: This function must be called once");
        }
    };



    Canva2D.API.ShapesDecorator = function(object, type, values) {
        if(!object.initShapesDecorator) 
            object.initShapesDecorator = false;
        let params;
        if(type === "circle") {
            params = [
                "pos",
                "r"
            ]
        } else if(type === "rect") {
            params = [
                "pos",
                "dimension"
            ]
        }
        let res = {};
        params.forEach(p => res[p] = null);
        if(!object.initShapesDecorator) {
            for(const key in values) {
                if(res[key] !== undefined) {
                    res[key] = values[key];
                } else {
                    console.warn(`Invalid Shape Key Rejected: "${key}"`);
                }
            }
            Object.setPrototypeOf(object, res);
            object.initShapesDecorator = true;
        } else {
            throw new Error("Fail to add new Shape decorator: This function must be called once");
        }
    };



};;{

    /**
     * @todo
     * -- Add {Multitouch support, direction, fullArea, boundingRect}
     * @param {String} type 
     * @param {Object} config 
     */
    const JoyStick = (function(type="use_default", config={}) {

        const {DEFAULT, TOUCH, MOUSE, Vector2} = Canva2D.API;

        let direction, 
            display = false, 
            isFading = false, 
            timeOutCounter = 0, 
            thisTouch = null,
            tpCache = []; // touch point cache

        let _config = {
            dynamic: true,
            pos: new Vector2(),
            innerRadius: 15,
            color: "lightgray",
            outlineColor: "#222",
            lineWidth: 4,
            outerRadius: 50,
            backgroundColor: "none",
            backgroundOutlineColor: "#222",
            backgroundLineWidth:4, 
            timeOut: 100,
            showLine: false,
            zIndex: 2000,
            offset: 10
        };

        var canvas = document.createElement("canvas");
        // canvas.style.backgroundColor = "green";
        canvas.style.position = "absolute";
        setConfig(config);
        document.body.appendChild(canvas);

        display = _config.dynamic ? false : true;

        let ctx = canvas.getContext("2d");
        let origin = new Vector2(canvas.width, canvas.height).scale(0.5);
        let throwtle = new Vector2(canvas.width, canvas.height).scale(0.5);

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            if(_config.dynamic) {
                if(display) {
                    if(isFading) {
                        timeOutCounter--;
                        let alpha = Math.abs(timeOutCounter / _config.timeOut);
                        ctx.globalAlpha = alpha;
                        if(alpha <= 0) {
                            display = false;
                            isFading = false;
                            timeOutCounter = _config.timeOut;
                        }
                    }
                }
            } else  ctx.globalAlpha = 1;
            _draw(origin.x, origin.y, _config.outerRadius, _config.backgroundColor, 
                _config.backgroundOutlineColor, _config.backgroundLineWidth);
            _draw(throwtle.x, throwtle.y, _config.innerRadius, 
                _config.color, _config.outlineColor, _config.lineWidth);
            ctx.restore();

            if(!display) canvas.style.display = "none";
            else canvas.style.display = "block";
            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);

        // set joystick config
        function setConfig(config) {
            for(const key in config) {
                if(_config[key] !== undefined) 
                    _config[key] = config[key];
            }
            if(!_config.dynamic) {
                canvas.style.left = `${_config.pos.x}px`;
                canvas.style.top = `${_config.pos.y}px`;
            }
            timeOutCounter = _config.timeOut;
            canvas.width = _config.outerRadius * 2 + _config.offset;
            canvas.height = _config.outerRadius * 2 + _config.offset;
            canvas.style.zIndex = `${_config.zIndex}`;
        };

        // draw Joystick
        function _draw(x, y, radius, fill, stroke, width=0) {
            ctx.save();
            ctx.lineWidth = width;
            ctx.strokeStyle = stroke || fill;
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.closePath();
            if(!(stroke === "none" || stroke === "")) ctx.stroke();
            if(!(fill === undefined || fill === "none" || fill === "")) ctx.fill();
            ctx.restore();
        };

        function hide() {
            display = false;
        };

        function show() {
            display = true;
        };

        // Normalise origin's coordinate
        const NMCOrigin = pos => ({
            x: (pos.x - _config.pos.x - canvas.width / 2) / (canvas.width/2),
            y: (pos.y - _config.pos.y - canvas.height / 2) / (canvas.height/2),
        });

        // Normalise throwtle's coordinate
        const NMCThrowtle = pos => ({
            x: (pos.x - _config.pos.x - canvas.width / 2) / (_config.innerRadius),
            y: (pos.y - _config.pos.y - canvas.height / 2) / (_config.innerRadius),
        });

        // set the direction of the joystick
        const setDirection = pos => {
            if(Math.abs(pos.x) > Math.abs(pos.y))
                direction = pos.x > 0 ? "right" : "left";
            else
                direction = pos.y > 0 ? "down" : "up"
        };

    
        function touch() {
            addEventListener("touchstart", e => {
                e.targetTouches.forEach(target => tpCache.push(target));
                tpCache.forEach(touch => {
                    let point = new Vector2(touch.pageX, touch.pageY);
                    if(!_config.dynamic) {
                        let _throwtleTouch = NMCThrowtle(point);
                        if(_throwtleTouch.x >= -1 && _throwtleTouch.x <= 1 && 
                            _throwtleTouch.y >= -1 && _throwtleTouch.y <= 1) {
                                thisTouch = touch;
                                API.isActive = true;
                                API.pointer = e;
                                if(typeof API.onStart === "function")
                                    API.onStart();
                        };
                    } else {
                        
                    }
                });
                // } else {
                    // _config.pos = {
                    //     x: e.clientX - _config.outerRadius - _config.offset/2,
                    //     y: e.clientY - _config.outerRadius - _config.offset/2
                    // };
                    // canvas.style.left = `${e.clientX - _config.outerRadius - _config.offset/2}px`;
                    // canvas.style.top = `${e.clientY - _config.outerRadius - _config.offset/2}px`;
                    // API.isActive = true;
                    // API.pointer = e;
                    // display = true;
                    // isFading = false;
                    // timeOutCounter = _config.timeOut;
                    // if(typeof API.onStart === "function")
                    //     API.onStart();
                // };
            });


            addEventListener("touchmove", e => {
                let cssPos = canvas.getBoundingClientRect();
                let nPos = Vector2.createFrom({
                    x: e.touches[0].pageX - cssPos.left + _config.innerRadius,
                    y: e.touches[0].pageY - cssPos.top + _config.innerRadius
                });
                let origin = Vector2.createFrom(_config.pos).add(
                    [_config.outerRadius/2, _config.outerRadius/2]);
                if(API.isActive) {
                    let diffPos = nPos.sub(origin);
                    let radius = Math.min(diffPos.length, _config.outerRadius - _config.innerRadius);
                    let angle = Math.atan2(diffPos.y, diffPos.x);
                    throwtle = {
                        x: origin.x - _config.innerRadius + Math.cos(angle) * radius,
                        y: origin.y - _config.innerRadius + Math.sin(angle) * radius
                    };
                    API.data = {
                        pointer: e,
                        angle: angle, 
                        length: radius, 
                        direction: "STATIC"
                    }
                    if(typeof API.onDrag === "function")
                        API.onDrag();
                }
                e.preventDefault();
            }, {passive:false});

            addEventListener("touchend", e => {
                let origin = Vector2.createFrom(
                    [_config.outerRadius, _config.outerRadius])
                throwtle = origin;
                API.isActive = false;
                isFading = true;
                if(typeof API.onEnd === "function")
                    API.onEnd();
            });
        };


        /**
         * Make Mouse control the Joystick
         */
        function mouse() {
            addEventListener("mousedown", e => {
                let _mouse = new Vector2(e.clientX, e.clientY);
                if(!_config.dynamic) {
                    let _throwtleTouch = NMCThrowtle(_mouse);
                    if(_throwtleTouch.x >= -1 && _throwtleTouch.x <= 1 && 
                        _throwtleTouch.y >= -1 && _throwtleTouch.y <= 1) {
                            API.isActive = true;
                            API.pointer = e;
                            if(typeof API.onStart === "function")
                                API.onStart();
                    };
                } else {
                    _config.pos = {
                        x: e.clientX - _config.outerRadius - _config.offset/2,
                        y: e.clientY - _config.outerRadius - _config.offset/2
                    };
                    canvas.style.left = `${e.clientX - _config.outerRadius - _config.offset/2}px`;
                    canvas.style.top = `${e.clientY - _config.outerRadius - _config.offset/2}px`;
                    API.isActive = true;
                    API.pointer = e;
                    display = true;
                    isFading = false;
                    timeOutCounter = _config.timeOut;
                    if(typeof API.onStart === "function")
                        API.onStart();
                };
            });

            addEventListener("mousemove", e => {
                let _mouse = new Vector2(e.clientX, e.clientY);
                if(API.isActive) {
                    let NMC = NMCOrigin(_mouse);
                    let diffPos = new Vector2(NMCOrigin(_mouse)).scale(_config.outerRadius);
                    let radius = Math.min(_config.outerRadius - _config.innerRadius, diffPos.length);
                    let angle = Math.atan2(NMC.y, NMC.x);
                    throwtle = {
                        x: origin.x + Math.cos(angle) * radius,
                        y: origin.y + Math.sin(angle) * radius
                    };
                    setDirection(diffPos);
                    API.pointer = e;
                    API.angle = angle;
                    API.radius = radius;
                    API.direction = direction;
                    if(typeof API.onDrag === "function")
                        API.onDrag();
                }
            });

            addEventListener("mouseup", e => {
                throwtle = new Vector2(canvas.width, canvas.height).scale(0.5);
                API.isActive = false;
                isFading = true;
                if(typeof API.onEnd === "function")
                    API.onEnd();
            });
        };

        // onStart, onDrag, onEnd
        var API = {
            isActive: false,
            setConfig: setConfig,
            hide: hide,
            show: show
        };

        switch(type) {
            case TOUCH:
                touch();
                break;
            case MOUSE:
                mouse();
                break;
            case DEFAULT:
                touch();
                mouse();
                break;
            default:
                throw new Error(`Please Provide a valid controller for the joystick`);
        };

        return API;
        
    });

    Object.defineProperties(Canva2D.API, {
        JoyStick: {value: JoyStick},
    });

};const Swipe = (function(element, type, single) {

    function getSwipeDirection(v1, v2) {
        let diffPos = {
            x: v2.x - v1.x,
            y: v2.y - v1.y
        };
        let dir = "";
        if(Math.abs(diffPos.x) > Math.abs(diffPos.y)) {
            if(diffPos.x > 0) 
                return [diffPos, "right"]
            return [diffPos, "left"]
        } else {
            if(diffPos.y > 0)
                return [diffPos, "down"]
            else return [diffPos, "up"]
        };
    };


    // function to handler swipe with touch
    function multiTouch(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("touchstart", e => {
            
        });
        
        ele.addEventListener("touchmove", e => {
            
        });
        
        ele.addEventListener("touchend", e => {
            
        });
    };

    // function that handles single touch events
    function singleTouch(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("touchstart", e => {
            el.data.origin = {x: e.touches[0].pageX, y: e.touches[0].pageY};
            el.data.isActve = true;
            if(typeof el.onSwipeStart === "function") el.onSwipeStart();
        });
        
        ele.addEventListener("touchmove", e => {
            let getDiffDir = getSwipeDirection(el.data.origin, {x: e.touches[0].pageX, y:e.touches[0].pageY});
            let newData = {
                mouse: e,
                currentPos: {x:e.touches[0].pageX, y:e.touches[0].pageY},
                diffPos: getDiffDir[0],
                direction: getDiffDir[1],
                angle: Math.atan2(getDiffDir[0].y, getDiffDir[0].x)
            };
            Object.assign(el.data, newData);
            if(typeof el.onSwipeMove === "function")
                el.onSwipeMove();
        e.preventDefault();
        }, {passive:false});
        
        ele.addEventListener("touchend", e => {
        el.data = {
            origin: {x: 0, y: 0},

            isActive: false,
            direction: null,
        };
            if(typeof el.onSwipeEnd === "function") el.onSwipeEnd();
        });
    };


    // function to handle mouse swipe
    function mouse(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("mousedown", e => {
            el.data.origin = {x: e.clientX, y: e.clientY};
            el.data.isActve = true;
            if(typeof el.onSwipeStart === "function") el.onSwipeStart();
        });
        
        ele.addEventListener("mousemove", e => {
            if(el.data.isActve) {
                let getDiffDir = getSwipeDirection(el.data.origin, {x: e.clientX, y:e.clientY});
                let newData = {
                    mouse: e,
                    currentPos: {x:e.clientX, y:e.clientY},
                    diffPos: getDiffDir[0],
                    direction: getDiffDir[1],
                    angle: Math.atan2(getDiffDir[0].y, getDiffDir[0].x)
                }
                el.data = newData;
                if(typeof el.onSwipeMove === "function") el.onSwipeMove();
            }
        });
        
        ele.addEventListener("mouseup", e => {
        el.data = {
            origin: {x: null, y: null},
            currentPos: {x:e.clientX, y:e.clientY},
            isActive: false,
            direction: null,
        };
            if(typeof el.onSwipeEnd === "function") el.onSwipeEnd();
        });
    };


    function Swipe(element, type, single) {
        this.element = element || null;
        this.single = single;
        // functions
        this.data = {};
        this.onStart = null;
        this.onMove = null;
        this.onEnd = null;
        
        if(type === "default") {
            mouse(this);
            if(this.single) singleTouch(this);
            else multiTouch(this);
        } else if(type === "touch") {
            if(single) singleTouch(this);
            else multiTouch(this);
        } else if(type === "mouse") {
            mouse(this);
        }        
    }

    return new Swipe(element, type, single);

});Canva2D.API.touch = (function(element=window) {

    let cache = [];

    class Touch {
        constructor() {
            this.touchCache = [];

            element.addEventListener("touchstart", e => {
                for(let i=0; i < e.targetTouches.length; i++)
                    this.touchCache.push(e.targetTouches);
            });
        }
    };

    return new Touch();

});window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000/60);
    }
})();



Object.defineProperties(HTMLElement.prototype, {
	// set styling to an HTML Element when called element.css({...styling});
    css: {
		value: function(styles) {
			if(!styles instanceof Object) 
				throw new Error(`CSS Styling data must be an instanceof an Object`)
			let res = "";
			for(const key in styles)
				this.style[key] = styles[key];
		},
		configurable: true,
		writable: false,
	},
	// set attributes to an HTML Element when called element.attr({..attributea});
	attr: {
		value: function(attrs) {
			if(!attrs instanceof Object) 
				throw new Error(`ATTR data must be an instanceof an Object`)
			for(const key in attrs) {
				this[key] = attrs[key];
			}
		},
		configurable: true,
		writable: false,
	}
    
});



Object.defineProperties(Math, {
	// convert from degree to radian
	degToRad: {
		value:function(number) {
			return number * this.PI / 180;
		},
		configurable: true,
		writable: false
	},
	// convert from radian to degree
	radToDeg: {
		value: function(number) {
			return number * 180 / this.PI;
		},
		configurable: true,
		writable: false
	},
	// check if a number is even or odd
	isEven: {
		value: function(number) {
			return !(number & 1)
		},
		configurable: true,
		writable: false
	},
	// return a random number between min-max
	randRange: {
		value: function(min=0, max=1) {
			return this.random() * (max - min + 1) + min;
		},
		configurable: true,
		writable: false
	}
    
});


/**
 * Basic Utility function
 * - calling method
 * Canva2D.API.$(identifier) ....
 */
Object.defineProperties(Canva2D.API, {
	$: {
		value: identifier => document.querySelector(identifier),
		writable: false
	},
	$all: {
		value: identifier => document.querySelectorAll(identifier),
		writable: false,
	},

	// get random item from an array
	randFromArray: {
		value: array => array[~~(Math.random() * array.length)],
		writable: false
	},

	// creates an animation's instance;
	createAnimation: {
		value: function(func) {
			if(!(typeof func === "function"))
				throw new Error("Failed to create Animation's instance: Expects a function as it's first argument");
			let _Res = {};
			_Res.startTime = new Date().getTime();
			_Res.play = () => {
				_Res.state = "active";
				func();
				_Res.id = requestAnimationFrame(_Res.play);
			};
			_Res.pause = () => {
				_Res.state = "pause";
				cancelAnimationFrame(_Res.id);
			};
			return _Res;
		},
		writable: false
	}

});;{

    /**
     * Launcher is a display screen that shows information's and logo
     * then disappers after sometimes. 
     * 
     * @var Launcher 
     * @description creates a launcher screen
     * @param {Object} config launcher's settings
     * 
     * config = {element, width, height, fontSize, timeOut, fontFamily}
     *  - config.element is the graphics for the launcher, this could be an HTMLDivElement
     *    if not element is added to the config keys, then Launcher uses the default
     * - config.height is the height of the launcher
     * - config.width is the width of the launcher
     * - config.fontSize(optional) : only when default config.element is use, set the fontSize
     *   of the launcher
     * - config.fontFamily(optional) : only when default config.element is use, set the fontSize
     *   of the launcher
     * - config.timeOut: boolean - set when the launcher should disapears
     * 
     * @returns {Promise} 
     * 
     * USAGE: 
     * let l = Canva2D.API.Launcher(config);
    */

    const {DEFAULT} = Canva2D.API;

    const Launcher = function(_element=DEFAULT, config={}) {
        
        let element = _element === DEFAULT ? document.createElement("CANVAS") : _element;
        if(_element === DEFAULT) {
            config.width = config.width || innerWidth;
            config.height = config.height || innerHeight;
            element.width = config.width;
            element.height = config.height;
            element.style.backgroundColor = config.theme === "dark" ? "#222" : "#fff";
        };
        element.id = "canva2d-launcher";
        element.style.position = "absolute";
        element.style.zIndex = "2000";
        document.body.insertBefore(element, document.body.childNodes[0]);
        
        let fontSize = config.fontSize || 35;
        let fontFamily = config.fontFamily || "Verdana";
        
        if(_element === DEFAULT) {
            let ctx = element.getContext("2d");
            // draw logo
            ctx.beginPath();
            ctx.moveTo(config.width/2, config.height/2 - 20);
            for(let i=0; i <= 360; i+=60) {
                let angle = Math.degToRad(i);
                let radius = fontSize * 3;
                let x = config.width/2 + Math.cos(angle) * radius;
                let y = (config.height/2 - 20) + Math.sin(angle) * radius;
                ctx.lineTo(x, y);
            }
            ctx.fillStyle = config.theme === "dark" ? "#333" : "dimgray";
            ctx.fill();            
            // bat text
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = config.theme === "dark" ? "dimgray" : "#fff";
            ctx.fillText("Canva2D", config.width/2, config.height/2 - 20);
            // bat description
            ctx.font = `bold ${fontSize - (fontSize-10)}px ${fontFamily}`;
            ctx.fillStyle = config.theme === "dark" ? "dimgray" : "lightgray";
            ctx.fillText("Games API for web developers", config.width/2, config.height/2 + 20);
            // copyright
            ctx.font = `bold 10px ${fontFamily}`;
            ctx.fillStyle = config.theme === "dark" ? "#fff" : "#222";
            ctx.fillText("Mirielle "+new Date().getFullYear(), config.width/2, config.height - 50);
        }
        
        
        return new Promise(resolve => {
            setTimeout(() => {
                document.body.removeChild(element);
                resolve({status:"done", timeOut:config.timeOut || 5000});
            }, config.timeOut || 5000);
        });
    };

    Object.defineProperty(Canva2D.API, "Launcher", {value: Launcher});

};;{

    /**
     * @function preloader
     * @description preloads media assets (image, audios, files)
     * @param  {...any} arg variable length arguments for the preloader
     * @returns {Promise} the promise state of the preloader
     */
    const Preloader = (function(...arg) {

        if(arg.length <= 1) 
            throw new Error("No Preloading assets Found");

        let _IMAGES_STACK = [],
            _AUDIOS_STACK = [],
            _FILES_STACK = [], 
            alpha = [];

        for(let i=65; i <= 122; i++) 
            alpha.push(String.fromCodePoint(i));
        
        /**
         * @function getName
         * @description retrieve the name of a media from it's source link
         * @param {String} source source of the media
         * @returns {String} the name of the media
         * 
         * source = "hlfllldfff.kdfkkdfl.//dfldfldflf/.google.com"
         * output = google
         */
        function getName(source) {
            let start = source.lastIndexOf(".");
            let name = "";
            while(alpha.includes(source[start - 1])) {
                start--;
                let currentChar = source[start];
                name += currentChar;
            };
            return name.split("").reverse().join("");
        };

        const getAudio = name => _AUDIOS_STACK.find(i => i.name === name).aud;
        const getImage = name => _IMAGES_STACK.find(i => i.name === name).img;
        const getFile = name => _FILES_STACK.find(i => i.name === name);


        function loadImage() {
            let _img;
            // check if the parameters is just an image src;
            if(arg.length === 2 && typeof arg[1] === "string") {
                _img = new Image();
                _img.src = arg[1];
            } else  _img = arg[1];
            return new Promise((resolve, reject) => {
                _img.addEventListener("load", e => {
                    let name = getName(_img.src);
                    resolve({img:_img, name});
                });
                _img.addEventListener("error", e => {
                    reject({status:"Failed", message:"Failed to Load Image: Something went Wrong", 
                        img:_img});
                });
                if(_img.src === "" && arg[2] !== undefined)
                    _img.src = arg[2];
                if(_img.src === "" && arg[2] === undefined)
                    reject({status:"Failed", message:"No Valid Source", img:_img});
            });
        };

        /**
         * Accepts all arguments as an image sources
         */
        async function loadImages() {
            let data = arg.splice(1, arg.length - 1);
            let promise = [];
            data.forEach(img => {
                if(typeof img === "string") {
                    let image = Canva2D.API.Preloader("singleImageOnly", img);
                    promise.push(image);
                } else if(img.hasOwnProperty("img") && img.hasOwnProperty("src")) {
                    let image = Canva2D.API.Preloader("singleImageOnly", img["img"], img["src"]);
                    promise.push(image);
                } else {
                    let image = Canva2D.API.Preloader("singleImageOnly", img);
                    promise.push(image);
                }
            });
            return await Promise.all(promise).then(e => {
                for(const img of e) 
                    _IMAGES_STACK.push(img);
                return _IMAGES_STACK;
            }).then(e => getImage);
        };


        function loadAudio() {
            let _aud;
            // check if the parameters is just an audio src;
            if(arg.length === 2 && typeof arg[1] === "string") {
                _aud = new Audio();
                _aud.src = arg[1];
                _aud.load();
            } else  _aud = arg[1];
            return new Promise((resolve, reject) => {
                _aud.addEventListener("canplay", e => {
                    let name = getName(_aud.src);
                    resolve({aud:_aud, name});
                });
                _aud.addEventListener("error", e => {
                    reject({status:"Failed", message:"Failed to Load Audio: Something went Wrong", 
                        aud:_aud});
                });
                if(_aud.src === "" && arg[2] !== undefined) {
                    _aud.src = arg[2];
                    _aud.load();
                }
                if(_aud.src === "" && arg[2] === undefined)
                    reject({status:"Failed", message:"No Valid Source", aud:_aud});
            });
        };

        // argument (aud) || (aud, src) || src
        async function loadAudios() {
            let data = arg.splice(1, arg.length - 1);
            let promise = [];
            data.forEach(aud => {
                if(typeof aud === "string") {
                    let audio = Canva2D.API.Preloader("singleAudioOnly", aud);
                    promise.push(audio);
                } else if(aud.hasOwnProperty("aud") && aud.hasOwnProperty("src")) {
                    let audio = Canva2D.API.Preloader("singleAudioOnly", aud["aud"], aud["src"]);
                    promise.push(audio);
                } else {
                    let audio = Canva2D.API.Preloader("singleAudioOnly", aud);
                    promise.push(audio);
                }
            });
            return await Promise.all(promise).then(e => {
                for(const aud of e) 
                    _AUDIOS_STACK.push(aud);
                return _AUDIOS_STACK;
            }).then(e => getAudio);
        };

        /**
         * loadAudio : function(playerId, source) {
    var player = document.getElementById(playerId);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        console.log('readyState: ' + request.readyState + ', status: ' + request.status)
        if (this.readyState == 4 && this.status == 200) {
            console.log(request.getAllResponseHeaders());
            var blob = new Blob( [request.response] );
            var url = URL.createObjectURL( blob );
            player.src = url;
            player.addEventListener('loaded', function(e) {
                URL.revokeObjectURL(player.src);
            });
            player.play();
        // Typical action to be performed when the document is ready:
        }
    };
    request.open("GET", source, true);
    request.send();
}

         */

        // coming soon
        function loadFile() {

        };

        // coming soon
        function loadFiles() {

        };


        class LoadAll {
            constructor() {
                let _data = arg.splice(1, arg.length - 1);
                let imgExtension = [".jpg", ".png", ".gif", ".jpeg"];
                let audioExtension = [".mp3", ".ogg"];
                let fileExtension = [".txt", ".json", ".obj"];

                let [images, audios, files] = [[], [], []];

                _data.forEach(data => {
                    if(typeof data === "string" && imgExtension.some(i => data.endsWith(i)) ||
                    typeof data === "object" && imgExtension.some(i => data.src.endsWith(i)) || 
                    data.type !== undefined && data.type === "img") {
                        let img = new Image();
                        img.src = typeof data === "string" ? data : data.src;
                        let name = getName(img.src);
                        images.push({img, name});
                    } else if(typeof data === "string" && audioExtension.some(i => data.endsWith(i)) ||
                    typeof data === "object" && audioExtension.some(i => data.src.endsWith(i)) || 
                    data.type !== undefined && data.type === "aud") {
                        let audio = new Audio()
                        audio.src = typeof data === "string" ? data : data.src;
                        let name = getName(audio.src);
                        audios.push({aud:audio, name});
                    } else if(typeof data === "string" && fileExtension.some(i => data.endsWith(i)) ||
                    typeof data === "object" && fileExtension.some(i => data.src.endsWith(i)) || 
                    data.type !== undefined && data.type === "file") {
                        let src = typeof data === "string" ? data : data.src;
                        files.push(src);
                    }
                });

                async function loadImages() {
                    let _images = [];
                    images.forEach(data => {
                        let promise = new Promise((resolve, reject) => {
                            data.img.addEventListener("load", e => {
                                resolve("loaded");
                            });
                            data.img.addEventListener("error", e => reject(`eRROR`));
                        });
                        _images.push(promise);
                    });
                    return await Promise.all(_images);
                };

                async function loadAudios() {
                    let _audios = [];
                    audios.forEach(data => {
                        data.aud.load();
                        let promise = new Promise((resolve, reject) => {
                            data.aud.addEventListener("canplay", e => resolve("loaded"));
                            data.aud.addEventListener("error", e => reject("error"));
                        });
                        _audios.push(promise);
                    });
                    return await Promise.all(_audios);
                };

                async function loadFiles() {
                    let _files = [];
                    files.forEach(file => {
                        let promise = new Promise((resolve, reject) => {
                            resolve(5);
                        });
                        _files.push(promise);
                    });
                    return await Promise.all(_files);
                }

                function getMedia(name, type="img") {
                    if(type === "img")
                        return images.find(i => i.name === name).img;
                    else if(type === "aud") 
                        return audios.find(i => i.name === name).aud;
                    else if(type === "file")
                        return audios.find(i => i.name === name).file;
                };

                async function loadAllAssets() {
                    let _images = await loadImages();
                    let _audios = await loadAudios();
                    let _files = await loadFiles();
                    return await Promise.all([_images, _audios, _files])
                    .then(e => getMedia);
                };

                this.loadAllAssets = loadAllAssets;

            }
        };
        
        switch(arg[0]) {
            case "singleImageOnly":
                return loadImage();
            case "multipleImagesOnly":
                return loadImages();
            case "singleAudioOnly":
                return loadAudio();
            case "multipleAudiosOnly":
                return loadAudios();
            case "singleFileOnly":
                return loadFile();
            case "multipleFilesOnly":
                return loadFiles();
            case "allFiles":
                return new LoadAll().loadAllAssets();
            default:
                throw new Error("Preloader expects Loading Mode as it's first argument");
        };

    });


    Object.defineProperties(Canva2D.API, {
        LOAD_IMAGE: {value: "singleImageOnly", writable:false},
        LOAD_IMAGES: {value: "multipleImagesOnly", writable:false},
        LOAD_AUDIO: {value: "singleAudioOnly", writable:false},
        LOAD_AUDIOS: {value: "multipleAudiosOnly", writable:false},
        LOAD_FILE: {value: "singleFileOnly", writable:false},
        LOAD_FILES: {value: "multipleFilesOnly", writable:false},
        LOAD_ALL: {value: "allFiles", writable: false},
        Preloader: {value: Preloader, writable: false},
    });

};;{

    /**
     * @function Scene
     * @description creates a scene page
     * @param {Number} width width of the canvas
     * @param {Number} height height of the canvas
     * @param {Boolean} dynamic wether the canvas should update animation's 
     * frame or not
     */
    const Scene = (function(width, height, dynamic=false) { 

        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        document.body.appendChild(canvas);

        let fps_timeStarted = performance.now();
        let timeStarted = new Date().getTime();
        let frameElapsedTimeStarted = new Date().getTime();
        let totalElapsedTimeStarted = new Date().getTime();

        let animationId;

        class Scene {
            /**
            * @constructor
            * @param {Number} width width of the scene
            * @param {Number} height height of the scene
            * @param {Boolean} dynamic should the scene requestAnimationFrame ? 
            */
            constructor(width, height, dynamic) {
                this._isDynamic = dynamic;
                this.update = null;
            }
            
            /**
            * @method getScene
            * @description get the canvas of this scene
            * @return {HTMLCanvasElement} the canvas of this scene
            */
            getScene() {
                return canvas;
            }
            
            /**
            * @method getContext
            * @description get the drawing context for the canvas of this scene
            * @param {String} contextType type of the canvas context
            * @return {CanvasRenderingContext2D} the drawing context for this scene
            */
            getContext(contextType) {
                return this.getScene().getContext(contextType);
            }
            
            setWidth(w) {
                this.getScene().width = w;
            }
            
            setHeight(h) {
                this.getScene().height = h;
            }
        
            /**
            * @method getWidth
            * @description get the width of this scene
            * @return {Number} the width for this scene
            */
            getWidth() {
                return this.getScene().width;
            }
        
            /**
            * @method getHeight
            * @description get the height of this scene
            * @return {Number} the height of this scene
            */
            getHeight() {
                return this.getScene().height;
            }
            
            /**
            * @method css
            * @description style this css width css using key-value syntax of the javascript object
            * @param {Object} styles styling data for this scene
            * styles = {backgroundColor, color};
            */
            css(styles) {
                this.getScene().css(styles);
            }
            
            /**
            * @method attr
            * @description give an attribute to this scene
            * attr = {id, class}
            */
            attr(att) {
                this.getScene().attr(att);
            }
        
            /**
            * @method getFPS
            * @description calculate the current fps for the scene
            * @return {Number} the fps
            */
            getFPS() {
                let t1 = performance.now();
                let fps = 1000 / (t1 - fps_timeStarted);
                fps_timeStarted = t1;
                return fps;
            }
        
        
            /**
            * @method getElapsedTimePS
            * @description elased time per seconds
            * @return {Number} total elapsed time in seconds
            */
            getTotalElapsedTimePS() {
                return (this.currentTime - totalElapsedTimeStarted) * .001;
            }
            
            /**
            * @method getFelapsedTimePS
            * @description elapsed time for every frame in seconds
            * @return {Number} fElapsedTime per seconds
            */
            getFelapsedTimePS() {
                let eTime = 0.001 * (this.currentTime - frameElapsedTimeStarted);
                frameElapsedTimeStarted = this.currentTime;
                // stop updating when tab switched
                if(eTime > 0.2) eTime = 0;
                return eTime;
            }
            
            animate() {
                const animate = currentTime => {
                    this.currentTime = new Date().getTime();
                    this.update();
                    animationId = requestAnimationFrame(animate);
                };
                return animate;
            }
            
            /**
            * @method start
            * @description start the scene
            */
            play() {
                if(this._isDynamic) {
                    fps_timeStarted = performance.now();
                    totalElapsedTimeStarted = new Date().getTime();
                    frameElapsedTimeStarted = new Date().getTime();
                    requestAnimationFrame(this.animate());            
                } else this.update();
                
            }

            pause() {
                cancelAnimationFrame(animationId);
            }
            
            addEventListener(type, callback, capture=false) {
                this.getScene().addEventListener(type, callback, capture);
            }
        }

        return new Scene(width, height, dynamic);
    });

    Object.defineProperty(Canva2D.API, "Scene", {value:Scene});

};// from goalKicker.com HTML5 Canvas Note for professional
{
	const {Vector2} = Canva2D.API.Vector2;

	const Collision = class {

		/**
		* @method circle
		* @checks for collisions between two circles
		* @param {Any} c1 the first circle
		* @param {Any} c2 the second circle
		* circle = {pos: , r:}
		*/
		static circle(c1, c2) {
			let diff = Vector2.createFrom(c2.pos).sub(Vector2.createFrom(c1.pos));
			return diff.length <= c1.r + c2.r;
		}
		/**
		* @method rect
		* @checks for collisions between two rectangles
		* @param {Any} r11 the first rectangle
		* @param {Any} r22 the second rectangle
		* rect = {pos: , dimension:}
		*/
		static rect(r11, r22) {
			let r1 = Component.Basic("rect", r11.pos, r11.dimension);
			let r2 = Component.Basic("rect", r22.pos, r22.dimension);
			return r1.pos.x + r1.dimension.x > r2.pos.x && r2.pos.x + r2.dimension.x > r1.pos.x
			&& r1.pos.y + r1.dimension.y > r2.pos.y && r2.pos.y + r1.dimension.y > r1.pos.y;
		}
		/**
		* @method circleRect
		* @checks for collisions between circle and a rectangle
		* @param {Any} c1 the circle
		* @param {Any} r1 the rectangle
		* circle = {pos, r}
		* rect = {pos: , dimension:}
		*/
		static circleRect(c1, r1) {
			let c = Component.Basic("circle", c1.pos, c1.r);
			let r = Component.Basic("rect", r1.pos, r1.dimension);
			let diff = {
				x: Math.abs(c.pos.x - (r.pos.x + r.dimension.x * 0.5)),
				y: Math.abs(c.pos.y - (r.pos.y + r.dimension.y * 0.5))
			};
			if(diff.x > c.r + r.dimension.x * 0.5) return false;
			if(diff.y > c.r + r.dimension.y * 0.5) return false;
			if(diff.x <= r.dimension.x) return true;
			if(diff.y <= r.dimension.y) return true;
			let dx = diff.x - r.dimension.x;
			let dy = diff.y - r.dimension.y;
			return Math.hypot(dx, dy) <= c.r * c.r;
		}
		/**
		* @method lineIntercept
		* @checks if two line segment are intercepting
		* @param {Any} l1 the first line
		* @param {Any} l2 the second line
		* line = {start: , end: }
		*/
		static lineIntercept(l11, l22) {
			let l1 = Component.Basic("line", l11.start, l11.end);
			let l2 = Component.Basic("line", l22.start, l22.end);
	
			function lineSegmentsIntercept(l1, l2) {
				let v1 = l1.end.sub(l1.start);
				let v2 = l2.end.sub(l2.start);
				let v3 = {x: null, y: null};
				let cross, u1, u2;
	
				if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
					return false;
				}
				v3 = l1.start.sub(l2.start);
				u2 = (v1.x * v3.y - v1.y * v3.x) / cross;
				if(u2 >= 0 && u2 <= 1) {
					u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
					return u1 >= 0 && u1 <= 1;
				}
				return false;
			}
	
			return lineSegmentsIntercept(l1, l2);
		}
		/**
		* @method pointAtLineIntercept
		* @checks if two line segment are intercepting
		* @param {Any} l1 the first line
		* @param {Any} l2 the second line
		* line = {start: , end: }
		*/
		static pointAtLineIntercept(l11, l22) {
			let l1 = Component.Basic("line", l11.start, l11.end);
			let l2 = Component.Basic("line", l22.start, l22.end);
	
			function lineSegmentsIntercept(l1, l2) {
				let v1 = l1.end.sub(l1.start);
				let v2 = l2.end.sub(l2.start);
				let v3 = {x: null, y: null};
				let cross, u1, u2;
	
				if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
					return false;
				}
				v3 = l1.start.sub(l2.start);
				u2 = (v1.x * v3.y - v1.y * v3.x) / cross;
				if(u2 >= 0 && u2 <= 1) {
					u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
					if(u1 >= 0 && u1 <= 1) {
						return l1.start.addScale(v1, u1);
					}
				}
				return false;
			}
	
			return lineSegmentsIntercept(l1, l2);
		}
		/**
		* @method lineInterceptCircle
		* @checks if a line intercepts a circle
		* @param {Any} l1 the line
		* @param {Any} c1 the circle
		* line = {start: , end: }
		* circle = {pos:, r:}
		*/
		static lineInterceptCircle(l1, c1) {
			let l = Component.Basic("line", l1.start, l1.end);
			let c = Component.Basic("circle", c1.pos, c1.r);
			let diff = c.pos.sub(l.start);
			let ndiff = l.end.sub(l.start);
			let t = diff.dot(ndiff) / (ndiff.x * ndiff.x + ndiff.y * ndiff.y);
			let nPoint = l.start.addScale(ndiff, t);
			if(t < 0) {
				nPoint.x = l.start.x;
				nPoint.y = l.start.y
			}
			if(t > 1) {
				nPoint.x = l.end.x;
				nPoint.y = l.end.y	
			}
			return (c.pos.x - nPoint.x) * (c.pos.x - nPoint.x) + (c.pos.y - nPoint.y) * (c.pos.y - nPoint.y) < c.r * c.r;
		}
		/**
		* @method lineInterceptRect
		* @checks if a line intercepts a rectangle
		* @param {Any} l1 the line
		* @param {Any} r1 the rectangle
		* line = {start: , end: }
		* circle = {pos:, dimension:}
		*/
		static lineInterceptRect(l1, r1) {
			let l = Component.Basic("line", l1.start, l1.end);
			let r = Component.Basic("rect", r1.pos, r1.dimension);
	
			function lineSegmentsIntercept(p0, p1, p2, p3) {
				var unknownA = (p3.x-p2.x) * (p0.y-p2.y) - (p3.y-p2.y) * (p0.x-p2.x);
				var unknownB = (p1.x-p0.x) * (p0.y-p2.y) - (p1.y-p0.y) * (p0.x-p2.x);
				var denominator = (p3.y-p2.y) * (p1.x-p0.x) -(p3.x-p2.x) * (p1.y-p0.y);
	
				if(unknownA==0 && unknownB==0 && denominator==0) return(null);
				if (denominator == 0) return null;
	
				unknownA /= denominator;
				unknownB /= denominator;
				var isIntersecting=(unknownA>=0 && unknownA<=1 && unknownB>=0 && unknownB<=1)
				return isIntersecting;
			}
	
			let p = {x: l.start.x, y: l.start.y};
			let p2 = {x: l.end.x, y: l.end.y};
	
			let q = r.pos;
			let q2 = {x: r.pos.x + r.dimension.x, y: r.pos.y};
			if(lineSegmentsIntercept(p, p2, q, q2)) return true;
			q = q2;
			q2 = {x: r.pos.x + r.dimension.x, y: r.pos.y + r.dimension.y};
			if(lineSegmentsIntercept(p, p2, q, q2)) return true;
			q = q2;
			q2 = {x: r.pos.x, y: r.pos.y + r.dimension.y};
			if(lineSegmentsIntercept(p, p2, q, q2)) return true;
			q = q2;
			q2 = {x: r.pos.x, y: r.pos.y};
			if(lineSegmentsIntercept(p, p2, q, q2)) return true;
			return false;
		}
		/**
		* @description checks if the point[x, y] is in an arc
		* @param {Vector2} p point to be checked
		* @param {Object} arc arc data
		// arc objects: {pos,innerRadius:,outerRadius:,startAngle:,endAngle:}
		// Return true if the x,y point is inside an arc
		*/
		static isPointInArc(p, arc) {
			if(arc.pos === undefined || arc.innerRadius === undefined || arc.outerRadius 
			=== undefined || arc.startAngle === undefined || arc.endAngle === undefined)
				throw new Error(`Insufficient Arc data: Must provide a "pos, innerRadius, outerRadius, startAngle, endAngle"`);
			let diff = p.sub(Vector2.createFrom(arc.pos));
			let rOuter = arc.outerRadius;
			let rInner = arc.innerRadius;
			if(diff.length < rInner || diff.length > rOuter) return false;
			let angle = (diff.angle + Math.PI * 2) % Math.PI*2;
			return angle >= arc.startAngle && angle <= arc.endAngle;
		}
		/**
		* @description checks if the point[x, y] is in a wedge
		* @param {Vector2} p point to be checked
		* @param {Object} wedge wedge data
		// wedge objects: {pos:,r:,startAngle:,endAngle:}
		// Return true if the x,y point is inside the closed wedge
		*/
		static isPointInWedge(p, wedge) {
			if(wedge.pos === undefined || wedge.r === undefined || wedge.startAngle === undefined)
				throw new Error(`Insufficient Wedge's data: Must provide a "pos, r, startAngle"`);
			let PI2 = Math.PI * 2;
			let diff = p.sub(wedge.pos);
			let r = wedge.r * wedge.r;
			if(diff.length > r) return false;
			let angle = (diff.angle + PI2) % PI2;
			return angle >= wedge.startAngle && angle <= wedge.endAngle;
		}
		/**
		* @description checks if the point[x, y] is in a circle
		* @param {Vector2} p point to be checked
		* @param {Vector2} c circle component
		*/
		static isPointInCircle(p, c) {
			let diff = new Vector2(p).sub(c.pos);
			return (diff.length < c.r * c.r);
		}
		/**
		* @description checks if the point[x, y] is in a rect
		* @param {Vector2} p point to be checked
		* @param {Vector2} c rect component
		*/
		static isPointInRect(p, r) {
			return (p.x > r.pos.x && p.x < r.pos.x + r.dimension.x 
				&& p.y > r.pos.y && p.y < r.pos.y + r.dimension.y);
		}
		
	};

	Object.defineProperty(Canva2D.API, "Collision", {value: Collision});

};;{

    const {Vector2, Vector3} = Canva2D.API;

    const TileCamera = (function(pos, dimension) {
        let [_pos, _dimension] = [new Vector2(pos), new Vector2(dimension)];
        let [minPos, maxPos] = [new Vector2(), new Vector2()];

        function setMapSize(size) {
            let _size = new Vector2(size);
            minPos = _pos.mult(_size.inverse()).applyFunc(Math.floor);
            maxPos = _pos.add(_dimension).mult(
                _size.inverse()).applyFunc(Math.ceil);
        };

        function setPosClamp(min, max) {
            let _min = new Vector2(min);
            let _max = new Vector2(max);
            if(_dimension.x > _max.x || _dimension.y > _max.y)
                throw new Error("Default dimension is greater than maximum clamp dimension");   
            if (_pos.x < _min.x)
                _pos.x = _min.x;
            else if (_pos.x + _dimension.x > _max.x)
                _pos.x = _max.x - _dimension.x;
    
            if (_pos.y < _min.y)
                _pos.y = _min.y;
            else if (_pos.y + _dimension.y > _max.y)
                _pos.y = _max.y - _dimension.y;
    
            if (_pos.z < _min.z) _pos.z = _min.z;
            else if (_pos.z > _max.z) _pos.z = _max.z;
        };

        function setMapClamp(min, max) {
            let _min = new Vector2(min);
            let _max = new Vector2(max);
            if (minPos.x < _min.x)
                minPos.x = _min.x;
            else if (maxPos.x > _max.x)
                maxPos.x = _max.x;
    
            if (minPos.y < _min.y)
                minPos.y = _min.y;
            else if (maxPos.y > _max.y)
                maxPos.y = _max.y;
        };

        let API = {
            pos: _pos,
            setMapSize: setMapSize,
            setMapClamp: setMapClamp,
            setPosClamp: setPosClamp,
            get minPos() { return minPos},
            get maxPos() { return maxPos }
        };

        return API;
    });

    const TileCame = class {
        /**
         * @constructor
         * @param {Vector3} camera's position in 3d space
         * @param {Vector3} camera's dimension in screen
         */
        constructor(pos = new Vector2(), dimension = new Vector2()) {
            this.pos = new Vector2(pos);
            this.dimension = new Vector2(pos);
            this.minPos = new Vector3();
            this.maxPos = new Vector3();
    
            this._isShaking = false;
        }

        /**
         * @method follow
         * @description determines the center of the camera
         * @param {Vector2} poss the positional vector
         * @param {Vector2} dimension the dimension of the component
        */
        follow(poss, dimensionn) {
            if (!this._isShaking) {
            this.pos.x = poss.x + dimensionn.x/2 - this.dimension.x/2;
            this.pos.y = poss.y + dimensionn.y/2 - this.dimension.y/2;
            }
        }
    
        shakeStart(range) {
            this._isShaking = true;
            let oldPos = new Vector2(this.pos.x, this.pos.y);
            this.pos.x = oldPos.x + Math.sin(Math.random() * 10) * range;
            this.pos.y = oldPos.y + Math.cos(Math.random() * 10) * range;
        }
    
        shakeEnd() {
            this._isShaking = false;
        }
    };

    Object.defineProperty(Canva2D.API, "TileCamera", {value: TileCamera});

};;{
    const {Vector2, ORTHORGONAL, ISOMETRIC, STATIC_FUNCTIONS, 
            mapRenderingError, tileMapError, CONSOLE } = Canva2D.API;
    
    const mapFunctions = () => {
        let API = {};
        return API;
    };


    const TileMap = (function(projectionType, array, dimension=[0,0], size=[0,0]) {
        let API = {};
        switch(projectionType) {
            case STATIC_FUNCTIONS:
                return mapFunctions;
            case ORTHORGONAL:
                API.type = "Orthorgonal";
                break;
            case ISOMETRIC:
                API.type = "Isometric";
                break;
            default:
                CONSOLE("warn", "The first argument to create a tileMap is undefined");
                throw tileMapError;
        };
        
        API.array = array.flat();
        API.dimension = new Vector2(dimension);
        API.size = new Vector2(size);
        API.index = new Vector2();
        API.draw = null;

        API.getItem = function(pos) {
            pos = new Vector2(pos);
            return this.array[pos.y * this.dimension.x + pos.x];
        };

        API.setItem = function(pos, value) {
            pos = new Vector2(pos);
            this.array[pos.y * this.dimension.x + pos.x] = value;
        };

        API.getIndexFromPos = function(pos) {
            let res = new Vector2();
            pos = new Vector2(pos);
            res.x = pos.x / API.size.x;
            res.y = pos.y / API.size.y;
            return res.applyFunc(Math.floor);
        };

        API.render = function(minView=0, maxView=API.dimension) {
            let _minView = new Vector2(minView);
            let _maxView = new Vector2(maxView);
            if(!(typeof API.draw === "function")) throw mapRenderingError;
            for(let r=_minView.y; r < _maxView.y; r++) {
                for(let c=_minView.x; c < _maxView.x; c++) {
                    API.index = new Vector2(c, r);
                    API.id = API.array[r * API.dimension.x + c];
                    API.draw();
                }
            };
        };

        return API;

    });

    Object.defineProperties(Canva2D.API, {
        TileMap: {value: TileMap}
    });

}; 