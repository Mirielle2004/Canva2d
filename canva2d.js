/**
 * Name         : Canva2d.js
 * @author      : Mirielle S. (codeBreaker!)
 * Last Modified: 26.06.2020
 * Revision     : 0.0.1
 * Minified with tersser
 * @url https://gist.github.com/gaearon/42a2ffa41b8319948f9be4076286e1f3
 * 
 * MIT License
 * 
 * Copyright (c) 2020 CodeBreaker
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
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
 */

CanvasRenderingContext2D.prototype.__proto__ = {

    clearColor(x, y, w, h, color) {
        this.fillStyle = color;
        if(color !== undefined)
            this.fillRect(x, y, w, h);
        else this.clearRect(x, y, w, h);
    },

};

/**
 * @description Vector 
 * 
 * diff(n) = n2 - (n1 || 0)
 * 
 * @param {number} x diff(X) of the vector
 * @param {number} y diff(Y) of the vector
 * 
 */
const Vector = function (x, y) {
    this.x = x;
    this.y = y;
    this.magnitude = Math.hypot(this.x, this.y);
    this.angle = 0;
}


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
    scalarMultiplication(scalar) {
        let x = this.x * scalar;
        let y = this.y * scalar;
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

    /**
     * @description computes additions, subtractions and division on a vector with a scalar.
     * @param {number} scalar The scaling value 
     * @param {string} operator specifies type of operation to be perfomed mostly [+,-,/]
     */
    scaleOperation(scalar, operator) {
        if(operator === "+")
            return new Vector(this.x + scalar, this.y + scalar);
        else if (operator === "-")
            return new Vector(this.x - scalar, this.y - scalar);
        else if (operator === "/")
            return new Vector(this.x / scalar, this.y / scalar);
        else {
            throw ("Invalid Operation's request on a Vector");
        }
    },
    
}



/**
 * @description Pricipal class that manipulates the canvas element and draws the canvas
 */
class Scene {
    /**
     * 
     * @param {Object} arg objects arguement for the scene, it accepts 
     * keyword arguements: width, height, backgroundColor, update and debug.
     * 
     */
    constructor(arg) {
        this.canvas = arg.canvas || null;
        try {
            this.ctx = this.canvas.getContext("2d");
        } catch(error) {
            throw ("Failed to initialize canvas");
        }
        this.width = arg.width || 300;
        this.height = arg.height || 300;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.update = arg.update || null;
        // if debug, you'll be getting console messages to keep track on the program
        this.debug = arg.debug || true;

        if(arg.backgroundColor !== "undefined")
            this.canvas.style.backgroundColor = arg.backgroundColor;
        this.checkDebug(console.log, "Scene created succesfully");

        this.currentTime = 0;
        this.animationFrame = null;
    }

    checkDebug(callback, message) {
        if(this.debug) callback(message);
    }

    // 
    mainLoop(callback) {
        this.checkDebug(console.log, "mainLoop's started");
        const animate = currentTime => {
            this.currentTime = currentTime;
            this.animationFrame = animate;
            callback();
        }
        requestAnimationFrame(animate);
    }
}

class Collision {

    static rect(player, obstacle) {
        return obstacle.x + obstacle.w > player.x && player.x + player.w > obstacle.x
        && obstacle.y + obstacle.h > player.y && player.y + player.h > obstacle.y
    }

}


class Component extends Vector {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        super(x, y);
        this.w = w;
        this.h = h;

        // JUMP 
        this.isJumping = false;
        this.jumpCounter = 0;
    }

    linearJump(arg) {
        if(this.isJumping) {
            if(this.jumpCounter === 0) {
                this.y -= arg.velY;
                if(this.y - this.h < arg.maxHeight) {
                    this.jumpCounter = 1;
                }
            } else {
                arg.velY += arg.gravity;
                this.y += arg.velY;
                if(this.y + this.h > arg.minHeight) {
                    this.isJumping = false;
                    arg.velY = 0;
                    this.jumpCounter = 0;
                }
            }
                
        }
    }


}
