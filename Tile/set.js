/**
 * @description creates Tileset
 */
class TileSet {
    /**
     * @constructor
     * @param {Object} param0 setup for the tileset
     * 
     */
    constructor({img=null, w=0, h=0, col=0, row=0, spacing=0, frame=[]}) {
        if(img !== null) {
            this.img = new Image();
            this.img.src = img;
        }
        this.w = w;
        this.h = h;
        this.col = col;
        this.row = row;
        this.spacing = spacing;
        // frame for sprite animation
        this.frame = frame;
    }

    /**
     * @description accepts a number and return it's 
     * corresponding x,y coordinates on the tile image
     * @param {Number} n value to get the index from
     * 
     */
    getIndex(n) {
        let x = ~~(n % this.col);
        let y = ~~(n / this.col);
        return new Vector(x, y);
    }

    /**
     * @description accpets a row/column number and 
     * return the value of their tile.
     * @param {Number} r row number
     * @param {Number} c column number
     * 
     */
    getTile(r, c) {
        return r * this.col + c;
    }
}
