/**
 * @description constructs tileMap on the canvas
 * 
 * A tilemap constructor accepts keyword arguments, including
 * map: the actual map to be drawn
 * w:       The width of the map
 * h:       The height of the map
 * tile:    tile info for the map
 * camera:  camera to the map
 * id:      current map value on iteration
 * row:     current row value on iteration
 * col:     current column value on iteration
 * path:    walkable tiles on the map
 * debug:    says when in debugging mode or not
 */
class TileMap {
    /**
     * @constructor
     * @param {object} arg keyword arguments for the tileMap
     * 
     */
    constructor(arg) {
        this.map = arg.map || [0];
        if(!(this.map instanceof Array))
            throw new Error("world map can only be respresented as a 2D Array");

        // tile
        this.w = arg.w;
        this.h = arg.h;

        this.mapSize = new Vector(this.map[0].length, this.map.length);      // How many columns and rows
        this.mapDimension = new Vector(this.w, this.h).multiply(this.mapSize);    // total size of rows and columns

        this.camera = arg.camera || new Camera(0, 0, this.mapDimension.x, this.mapDimension.y);
        if(!(this.camera instanceof Camera)) {
            this.checkDebug(console.log, "Camera can only be a prototype of Camera");
            throw new Error("Failed to initialize camera");
        }
        this.camera.maxDimension = this.mapDimension;

        this.path = arg.path || [];
        this.id = null;
        this.row = null;
        this.col = null;
        this.debug = false || arg.debug;
        this.checkDebug(console.log, "Map Created successfully");
    }

    /**
     * @description set the current map to a new map
     * @param {Object} map An array of map
     */
    setMap(map) {
        this.map = map;
    }

    /**@returns the current map */
    getMap() {
        return this.map;
    }

    /**
     * @description render tileMap to the canvas on a GO
     * @param {function} callback A function to describing how the tile should be drawn
     * you can access the mapId, current row and col to render each tile inside this 
     * function
     * 
     */
    renderMap(callback) {

        // clamp the tile view
        let x_min = ~~(this.camera.x / this.w);
        let y_min = ~~(this.camera.y / this.h);

        let x_max = Math.ceil((this.camera.x + this.camera.w) / this.w);
        let y_max = Math.ceil((this.camera.y + this.camera.h) / this.h);

        // x_min = Math.min(Math.max(0, x_min), Math.min(this.mapSize.x, Math.max(0, x_max)));
        // y_min = Math.min(Math.max(0, y_min), Math.min(this.mapSize.y, Math.max(0, y_max)));

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
     * @description
     * @param {number} x pos of the Object in X-axis
     * @param {number} y pos of the Object in Y-axis
     * @returns the value corresponding to x and y on the map
     */
    tileAt(x, y) {
        let pos = new Vector(~~(x / this.w), ~~(y / this.h));
        return this.map[pos.y][pos.x];
    }

}



Object.assign(TileMap.prototype, AbstractBaseMixin);
