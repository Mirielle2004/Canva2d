{

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

};