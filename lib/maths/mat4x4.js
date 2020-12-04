/**
 * @class Mat4x4
 * A 4x4 matrix class, data could be an array or a Mat4x4 object
 * @todo add inverse / multiplication methods, fix trnaspose
 * 
 */
class Mat4x4 {
    /**
     * @static validate
     * @description validate a 4x4 matrix data
     * @throws Error
     * @param {Object} data matrix data
     */
    static validate(data) {
        let isValid = false;
        if(data instanceof Array) {
            if(data.length === 4) {
                for(let i=data.length-1; i > 0; i--) {
                    if(data[i].length < 4) 
                        throw new Error("Insufficient 4x4 matrice data");
                }
            } else {
                throw new Error("Insufficient 4x4 matrice data");
            }
        } else 
            throw new Error("Matrix must be an instance of Array");
    }

    /**
     * @static getData
     * @description get the data for a mat4x4 object
     * @param {Object} arg return a Mat4x4 matrix data
     * @returns {Array} the mat4x4 data
     */
    static getData(arg) {
        if(arg instanceof Mat4x4) 
            return arg.data;
        else if(arg instanceof Array) {
            Mat4x4.validate(arg);
            return arg;
        }
        else 
            throw new Error("getData expects an argument of an Array instance");
    }

    /**
     * @static multiplyVec
     * @description multiply a vector by a matrix
     * @param {Object} vec a column vector 
     * @param {Object} mat a matrix
     * @returns {Array} a column vector
     */
    static multiplyVec(vec, mat) {
        let res = [];
        let tmp = 0;
        let matData = Mat4x4.getData(mat);
        let vecData = vec;
        if(vec instanceof Array && vec.length === 4) 
            vecData = vec;
        else if(vec instanceof Object && vec.hasOwnProperty("x") 
            && vec.hasOwnProperty("y") && vec.hasOwnProperty("z")) {
                vecData = [vec.x, vec.y, vec.z, 1]
            }
        // multiply vec by row matrices
        for(let r=0; r < matData.length; r++) {
            tmp = 0;
            for(let j=0; j < matData.length; j++) {
                let prod = vecData[j] * matData[j][r];
                tmp += prod;
            }
            res.push(tmp);
        }
        // return back to 3d space
        if(res[3] !== 0) {
            for(let i=0; i < res.length - 1; i++) {
                res[i] /= res[3];
            }
        }
        return res;
    };

    /**
     * @static createEmpty
     * @description creates an empty matrix
     * @returns {Mat4x4}
     */
    static createEmpty() {
        return new Mat4x4([
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
        ]);
    }

    /**
     * @static rotateX
     * @description create a roll rotation matrix
     * @param {Number} angle angle to rotate by
     * @returns {Mat4x4}
     */
    static rotateX(angle) {
        return new Mat4x4([
            [1, 0, 0, 0],
            [0, Math.cos(angle), Math.sin(angle), 0],
            [0, -Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 0, 1]
        ]);
    }
    
    /**
     * @static rotateY
     * @description create a yaw rotation matrix
     * @param {Number} angle angle to rotate by
     * @returns {Mat4x4}
     */
    static rotateY(angle) {
        return new Mat4x4([
            [Math.cos(angle), 0, Math.sin(angle), 0],
            [0, 1, 0, 0],
            [-Math.sin(angle), 0, Math.cos(angle), 0],
            [0, 0, 0, 1]
        ]);
    }
    
    /**
     * @static rotateZ
     * @description create a pitch rotation matrix
     * @param {Number} angle angle to rotate by
     * @returns {Mat4x4}
     */
    static rotateZ(angle) {
        return new Mat4x4([
            [Math.cos(angle), Math.sin(angle), 0, 0],
            [-Math.sin(angle), Math.cos(angle), 0, 0],
            [0, 0, 1, 0], [0, 0, 0, 1]
        ]);
    }

    /**
     * @static project3d
     * @description a 3d perspective projection matrix
     * @param {Number} ar aspect ratio
     * @param {Number} fov field of view
     * @param {Number} zNear farthest distance on the Z-axis
     * @param {Number} zFar neareast distance on the Z-axis
     * @returns {Mat4x4} 3d projection matrix
     */
    static project3d(ar, fov, zNear=0.1, zFar=1000) {
        let q = zFar / (zFar - zNear);
        return new Mat4x4([
            [ar * fov, 0, 0, 0],
            [0, fov, 0, 0],
            [0, 0, q, 1],
            [0, 0, -zNear * q, 0]
        ]);
    }

    /**
     * @constructor
     * @param {Array} data The matrix data
     */
    constructor(data) {
        Mat4x4.validate(data);
        this.data = data;
    }

    /**
     * @method add
     * @description add two matrices
     * @param {Object} arg a matrix
     * @returns {Mat4x4}
     */
    add(arg) {
        let res = [];
        let mat = Mat4x4.getData(arg);
        for(let r=0; r < this.data.length; r++) {
            res.push(new Array(4));
            for(let j=0; j < this.data.length; j++) {
                res[r][j] = this.data[r][j] + mat[r][j];
            }
        }
        return new Mat4x4(res);
    }

    /**
     * @method sub
     * @description addition of matrices
     * @param {Object} arg a matrix
     * @returns {Mat4x4}
     */
    sub(arg) {
        let res = [];
        let mat = Mat4x4.getData(arg);
        for(let r=0; r < this.data.length; r++) {
            res.push(new Array(4));
            for(let j=0; j < this.data.length; j++) {
                res[r][j] = this.data[r][j] - mat[r][j];
            }
        }
        return new Mat4x4(res);
    }

    /**
     * @method scale
     * @description scalar multiplication of matrices
     * @param {Object} arg a matrix
     * @returns {Mat4x4}
     */
    scale(s) {
        let res = [];
        for(let r=0; r < this.data.length; r++) {
            res.push([]);
            for(let c=0; c < this.data.length; c++) {
                res[r][c] = this.data[r][c] * s;
            }
        }
        return new Mat4x4(res);
    }

    /**
     * @method determinant
     * @description find the determinant of a matrix
     * @returns {Number} the determinant of a matrix
     */
    determinant() {
        let a = this.data[0][0] * (this.data[1][1] * (this.data[2][2] * this.data[3][3] - this.data[2][3] * this.data[3][2]));
        let b = this.data[0][1] * (this.data[1][0] * (this.data[2][2] * this.data[3][3] - this.data[2][3] * this.data[3][2]));
        let c = this.data[0][2] * (this.data[1][0] * (this.data[2][1] * this.data[3][3] - this.data[2][3] * this.data[3][1]));
        let d = this.data[0][3] * (this.data[1][0] * (this.data[2][1] * this.data[3][2] - this.data[2][2] * this.data[3][1]));
        return a - b + c - d;
    }

    /**
     * @method transpose
     * @description transpose a n * m matrix to m * n matrix
     * @returns {Mat4x4} the transpose of a matrix
     */
    transpose() {
        return new Mat4x4([
            [this.data[0][0], this.data[1][0], this.data[2][0], this.data[3][0]],
            [this.data[0][1], this.data[1][1], this.data[2][1], this.data[3][1]],
            [this.data[0][2], this.data[1][2], this.data[2][2], this.data[3][2]],
            [this.data[0][4], this.data[1][4], this.data[2][4], this.data[3][4]]
        ]);
    }

}