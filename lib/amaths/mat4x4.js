;{
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
};