/**
 * 
 * @description setup for tiledMap creation
 * 
 */
class TileMap {

    /**
     * @constructor
     * @param {Object} param0 setup params for the tile
     * 
     */
    constructor({map=[0], w, h, camera, defs={default:0}}) {
        this.map = map;
        if(!(this.map instanceof Array) || this.map.length <= 0 || this.map[0][0].length <= 0)
            throw new Error("world map can only be respresented as a 2D Array");

        // tile
        this.w = w;
        this.h = h;

        this.mapSize = new Vector(this.map[0].length, this.map.length);      // How many columns and rows
        this.mapDimension = new Vector(this.w, this.h).multiply(this.mapSize);    // total size of rows and columns

        this.camera = camera || new Camera(0, 0, this.mapDimension.x, this.mapDimension.y);
        if(!(this.camera instanceof Camera)) {
            throw new Error("Failed to initialize camera: camera must be an instance of `Camera`");
        }
        this.camera.maxDimension = this.mapDimension;

        this.id = null;
        this.row = null;
        this.col = null;

        this.defs = defs;
    }

    set(map) {
        this.map = map;
    }

    /**
     * @description render tileMap to the canvas on a GO
     * @param {function} callback A function to customize the map rendering, you can
     * access the current mapId, mapRow and mapCol in this function
     * 
     */
    render(callback) {

        let x_min = ~~(this.camera.x / this.w);
        let y_min = ~~(this.camera.y / this.h);

        let x_max = Math.ceil((this.camera.x + this.camera.w) / this.w);
        let y_max = Math.ceil((this.camera.y + this.camera.h) / this.h);

        for(let r = y_min; r < y_max; r++) {
            for(let c = x_min; c < x_max; c++) {
                this.id = this.map[r][c];
                this.row = r;
                this.col = c;
                callback();
            }
        }

    }

    /**
     * 
     * @description returns the value at an integral index
     * @param {number} x pos of the Object in X-axis
     * @param {number} y pos of the Object in Y-axis
     * @returns the value corresponding to x and y on the map
     * 
     */
    getTile(v) {
        let pos = new Vector(~~(v.x / this.w), ~~(v.y / this.h));
        return this.map[pos.y][pos.x];
    }

    /**
     * 
     * @description accepts a vector as the first arguement and set the 
     * tile corresponding to the vector to the value in the second argument
     * @param {Vector} v vector with a defined x,y
     * @param {Any} value new value for the current tile
     * 
     */
    setTile(v, value) {
        let pos = {x: ~~(v.x / this.w), y: ~~(v.y / this.h)};
        this.map[pos.y][pos.x] = value;
    }

    /**
     * 
     * @description get the item value in a map def
     * @param {String} name name of the def items 
     * @returns {Object} value of the def item
     * 
     */
    getDefs(name) {
        if(this.defs[name] !== undefined)
            return this.defs[name];
        else 
            throw new Error(`"${name}" is not a valid defs name`);
    }

}


Object.assign(TileMap.prototype, TileMapCollision);
