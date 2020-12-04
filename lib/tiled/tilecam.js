class TileCamera {
    /**
     * @constructor
     * @param {Vector3} camera's position in 3d space
     * @param {Vector3} camera's dimension in screen
     */
    constructor(pos = new Vector3(), dimension = new Vector3()) {
        this.pos = Vector3.createFrom(pos);
        this.dimension = Vector3.createFrom(dimension);
        this.minPos = new Vector3();
        this.maxPos = new Vector3();

        this._isShaking = false;
    }

    /**
     * @method lookAt
     * @description set the minimum and maximum visible area of the camera
     * @param {Array} map the map
     * @param {Vector2} the size of each tile in the map
     */
    lookAt(map, sizee) {
        let size = Vector3.createFrom(sizee);
        this.pos.z = size.z;
        this.minPos = this.pos.mult(size.inverse()).applyFunc(Math.floor);
        this.maxPos = this.pos.add(this.dimension).mult(
            size.inverse()).applyFunc(Math.ceil);
    }

    /**
     * @method setMapClamp
     * @description set the minimum and maximum indexes from the array
     * @param {Vector2} minn the minimum indexes on the array
     * @param {Vector2} maxx the maximum indexes on the array
     */
    setMapClamp(minn, maxx) {
        let min = Vector3.createFrom(minn);
        let max = Vector3.createFrom(maxx);
        if (this.minPos.x < min.x)
            this.minPos.x = min.x;
        else if (this.maxPos.x > max.x)
            this.maxPos.x = max.x;

        if (this.minPos.y < min.y)
            this.minPos.y = min.y;
        else if (this.maxPos.y > max.y)
            this.maxPos.y = max.y;
    }

    /**
     * @method setMapClamp
     * @description set the minimum and maximum position in worldspace
     * @param {Vector2} minn the minimum position on the canvas
     * @param {Vector2} maxx the maximum position on the canvas
     */
    setPosClamp(minn, maxx) {
        let min = Vector3.createFrom(minn);
        let max = Vector3.createFrom(maxx);
        if (this.pos.x < min.x)
            this.pos.x = min.x;
        else if (this.pos.x + this.dimension.x > max.x)
            this.pos.x = max.x - this.dimension.x;

        if (this.pos.y < min.y)
            this.pos.y = min.y;
        else if (this.pos.y + this.dimension.y > max.y)
            this.pos.y = max.y - this.dimension.y;

        if (this.pos.z < min.z) this.pos.z = min.z;
        else if (this.pos.z > max.z) this.pos.z = max.z;
    }

    /**
     * @method follow
     * @description determines the center of the camera
     * @param {Vector2} poss the positional vector
     * @param {Vector2} dimension the dimension of the component
     */
    follow(poss, dimensionn) {
        if (!this._isShaking) {
        this.pos.x = poss.x + dimensionn.x/2 - this.dimension.x/2;
        this.pos.y = poss.y + dimensionn.y/2 - this.dimension.y/2;
        }
    }

    shakeStart(range) {
        this._isShaking = true;
        let oldPos = new Vector2(this.pos.x, this.pos.y);
        this.pos.x = oldPos.x + Math.sin(Math.random() * 10) * range;
        this.pos.y = oldPos.y + Math.cos(Math.random() * 10) * range;
    }

    shakeEnd() {
        this._isShaking = false;
    }
}