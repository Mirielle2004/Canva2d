/**
* @description Component's Base class
*/
class Component extends Vector {
    /**
     * 
     * @param {Object} param0 component's base params
     */
    constructor({x=0, y=0, w=0, h=0, r=null, x0=null, y0=null, x1=null, y1=null}) {
        super(x, y);
        // polygons
        this.w = w;
        this.h = h;
        // circle
        this.r = r;
        // lines
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
        this.vel = new Vector(0, 0);
        this.s = 0;
        this.m = 5;     // mass
        this.type = this.x0 !== null ? "line" : this.r !== null ? "circle" : "polygon";
    }

    getCenterX() {
        if(this.type === "circle")  return this.x;
        return this.x + this.w * .5;
    }

    getCenterY() {
        if(this.type === "circle") return this.y;
        return this.y + this.h * .5;
    }
}
