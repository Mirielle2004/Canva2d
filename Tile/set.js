class TileSet {
    constructor(arg) {
        this.img = new Image();
        this.img.src = arg.img;
        this.w = arg.w;
        this.h = arg.h;
        this.col = arg.col;
        this.row = arg.row;
        this.spacing = arg.spacing || 0;
        // frame for sprite animation
        this.frame = arg.frame;
    }

    tileAt(pos) {
        return new Vector(pos.x / this.w, pos.y / this.h);
    }

    indexAt(value) {
        let x = ~~(value % this.col);
        let y = ~~(value / this.col);
        return new Vector(x, y);
    }

    valueAt(row, col) {
        return row * this.col + col;
    }
}
