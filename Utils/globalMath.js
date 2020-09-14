Math.__proto__ = {

    /**
     * 
     * @description Get random numbers within a specified range
     * @param {Number} min Minimum value's range
     * @param {Number} max Maximum value's range
     * @returns {Numer} Number between min and max
     * 
     */
    randRange(min=0, max=1) {
        return this.random() * (max - min + 1) + min;
    },

    /**
     * 
     * @description Get random items from an array
     * @param {Array} arr Array to get random items from.
     * @returns {Any} Random items from an array
     * 
     */
    randFromArray(arr) {
        return arr[this.random() * arr.length | 0];
    },

    /**
     * 
     * @description Converts a given number to radian
     * @param {Number} n Number to be converted into radian
     * @returns {Number} Argument in radian
     * 
     */
    toRadian(n) {
        return n * this.PI / 180;
    },

    /**
     * @description Converts a given number to degree
     * @param {Number} value Number to be converted into degree
     * @returns {Number} Argument in degree.
     */
    toDegree(value) {
        return value * 180 / this.PI;
    }

}
