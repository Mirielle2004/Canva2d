/**
* @description Handy class for scene's components
*/
class Component extends Vector {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        super(x, y);
        this.w = w;
        this.h = h;
    }

    getCenterX() {
        return this.x + this.w * .5;
    }

    getCenterY() {
        return this.y + this.h * .5;
    }
}
