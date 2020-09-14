const TileMapCollision = {

    nextTile: [],
    nextTilePos: [],
    newPos: {x: null, y: null},

    /**
     * 
     * @param {Component} c A rectangular component
     * @param {String} type type of the component
     * @param {Object} param2 contains list of callback functions triggered on every collision's direction
     * 
     */
    checkCollision(c, type="rect", {left=null, right=null, 
        up=null, down=null, timeElapsed={x:1, y:1}}) {
        // let t1, t2;
        let obj, p1, p2, t1, t2;
        if(type === "rect") {
            obj = {
                x: c.x, y: c.y,
                w: c.w, h: c.h
            }
        } else {
            throw TypeError(`only rect to rect collision checking exists`);
        }

        let newPos = {
            x: c.x + c.vel.x * timeElapsed.x, 
            y: c.y + c.vel.y * timeElapsed.y
        };

        // horizontal boundary
        if(c.vel.x <= 0) {

            this.nextTilePos[0] = {x: newPos.x, y: obj.y};
            this.nextTilePos[1] = {x: newPos.x, y: obj.y + obj.h + 0.9 - 1};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.x = parseInt(newPos.x);
            if(typeof left === "function") left();
        } 
        else {

            this.nextTilePos[0] = {x: newPos.x + obj.w - 1, y: obj.y};
            this.nextTilePos[1] = {x: newPos.x + obj.w - 1, y: obj.y + obj.h + 0.9 - 1};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.x = parseInt(newPos.x);
            if(typeof right === "function") right();

        }

        // vertical boundary
        if(c.vel.y <= 0) {

            this.nextTilePos[0] = {x: newPos.x, y: newPos.y};
            this.nextTilePos[1] = {x: newPos.x + obj.w + 0.9 - 1, y: newPos.y};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.y = parseInt(newPos.y);
            if(typeof up === "function") up();
        } 
        else {

            this.nextTilePos[0] = {x: newPos.x, y: newPos.y + c.h - 1};
            this.nextTilePos[1] = {x: newPos.x + obj.w + 0.9 - 1, y: newPos.y + obj.h - 1};
            t1 = this.getTile(this.nextTilePos[0]);
            t2 = this.getTile(this.nextTilePos[1]);
            this.nextTile = [t1, t2];
            this.newPos.y = parseInt(newPos.y);
            if(typeof up === "function") up();
        }

    }

};
