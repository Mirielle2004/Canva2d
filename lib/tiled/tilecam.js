;{

    const {Vector2, Vector3} = Canva2D.API;

    const TileCamera = (function(pos, dimension) {
        let [_pos, _dimension] = [new Vector2(pos), new Vector2(dimension)];
        let [minPos, maxPos] = [new Vector2(), new Vector2()];

        function setMapSize(size) {
            let _size = new Vector2(size);
            minPos = _pos.mult(_size.inverse()).applyFunc(Math.floor);
            maxPos = _pos.add(_dimension).mult(
                _size.inverse()).applyFunc(Math.ceil);
        };

        function setPosClamp(min, max) {
            let _min = new Vector2(min);
            let _max = new Vector2(max);
            if(_dimension.x > _max.x || _dimension.y > _max.y)
                throw new Error("Default dimension is greater than maximum clamp dimension");   
            if (_pos.x < _min.x)
                _pos.x = _min.x;
            else if (_pos.x + _dimension.x > _max.x)
                _pos.x = _max.x - _dimension.x;
    
            if (_pos.y < _min.y)
                _pos.y = _min.y;
            else if (_pos.y + _dimension.y > _max.y)
                _pos.y = _max.y - _dimension.y;
    
            if (_pos.z < _min.z) _pos.z = _min.z;
            else if (_pos.z > _max.z) _pos.z = _max.z;
        };

        function setMapClamp(min, max) {
            let _min = new Vector2(min);
            let _max = new Vector2(max);
            if (minPos.x < _min.x)
                minPos.x = _min.x;
            else if (maxPos.x > _max.x)
                maxPos.x = _max.x;
    
            if (minPos.y < _min.y)
                minPos.y = _min.y;
            else if (maxPos.y > _max.y)
                maxPos.y = _max.y;
        };

        let API = {
            pos: _pos,
            setMapSize: setMapSize,
            setMapClamp: setMapClamp,
            setPosClamp: setPosClamp,
            get minPos() { return minPos},
            get maxPos() { return maxPos }
        };

        return API;
    });

    const TileCame = class {
        /**
         * @constructor
         * @param {Vector3} camera's position in 3d space
         * @param {Vector3} camera's dimension in screen
         */
        constructor(pos = new Vector2(), dimension = new Vector2()) {
            this.pos = new Vector2(pos);
            this.dimension = new Vector2(pos);
            this.minPos = new Vector3();
            this.maxPos = new Vector3();
    
            this._isShaking = false;
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
    };

    Object.defineProperty(Canva2D.API, "TileCamera", {value: TileCamera});

};