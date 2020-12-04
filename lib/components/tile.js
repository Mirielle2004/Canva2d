class TileComponent {
    
    constructor(pos, dimension) {
        this.pos = Vector2.createFrom(pos);
        this.dimension = Vector2.createFrom(dimension);
        
        this._cBoundary = {
            pos: {x:0, y:0},
            dimension: this.dimension
        };
        
        this.lastPos = null;
        this.nextPos = null;
        this.currentPos = null;
        
        this._minPos = null;
        this._maxPos = null;
    }
    
    checkCollision(map, velocity, {left=null, top=null}) {
        // X-axis
        this.lastPos = this.pos;
        this.nextPos = Vector2.createFrom({
            x: this.lastPos.x + velocity.x,
            y: this.lastPos.y 
        });
        
        this._minPos = this.nextPos.mult(map.size.inverse()).applyFunc(Math.floor);
        this._maxPos = this.nextPos.add(this._cBoundary.dimension).mult(map.size.inverse()).applyFunc(Math.ceil);
        
        for(let r=this._minPos.y; r < this._maxPos.y; r++) {
            for(let c=this._minPos.x; c < this._maxPos.x; c++) {
                this.currentPos = map.getId([c, r]);
                if(typeof left === "function") left();
            }   
        }
        
        this.pos.x = this.nextPos.x;
        
        // Y-axis
        this.lastPos = this.pos;
        this.nextPos = Vector2.createFrom({
            x: this.lastPos.x,
            y: this.lastPos.y + velocity.y 
        });
        
        this._minPos = this.nextPos.mult(map.size.inverse()).applyFunc(Math.floor);
        this._maxPos = this.nextPos.add(this._cBoundary.dimension).mult(map.size.inverse()).applyFunc(Math.ceil);
        
        for(let r=this._minPos.y; r < this._maxPos.y; r++) {
            for(let c=this._minPos.x; c < this._maxPos.x; c++) {
                this.currentPos = map.getId([c, r]);
                if(typeof top === "function") top();
            }   
        }
        
        this.pos.y = this.nextPos.y;
        
    }
    
}