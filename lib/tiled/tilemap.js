;{
    const {Vector2, ORTHORGONAL, ISOMETRIC, STATIC_FUNCTIONS, 
            mapRenderingError, tileMapError, CONSOLE } = Canva2D.API;
    
    const mapFunctions = () => {
        let API = {};
        return API;
    };


    const TileMap = (function(projectionType, array, dimension=[0,0], size=[0,0]) {
        let API = {};
        switch(projectionType) {
            case STATIC_FUNCTIONS:
                return mapFunctions;
            case ORTHORGONAL:
                API.type = "Orthorgonal";
                break;
            case ISOMETRIC:
                API.type = "Isometric";
                break;
            default:
                CONSOLE("warn", "The first argument to create a tileMap is undefined");
                throw tileMapError;
        };
        
        API.array = array.flat();
        API.dimension = new Vector2(dimension);
        API.size = new Vector2(size);
        API.index = new Vector2();
        API.draw = null;

        API.getItem = function(pos) {
            pos = new Vector2(pos);
            return this.array[pos.y * this.dimension.x + pos.x];
        };

        API.setItem = function(pos, value) {
            pos = new Vector2(pos);
            this.array[pos.y * this.dimension.x + pos.x] = value;
        };

        API.getIndexFromPos = function(pos) {
            let res = new Vector2();
            pos = new Vector2(pos);
            res.x = pos.x / API.size.x;
            res.y = pos.y / API.size.y;
            return res.applyFunc(Math.floor);
        };

        API.render = function(minView=0, maxView=API.dimension) {
            let _minView = new Vector2(minView);
            let _maxView = new Vector2(maxView);
            if(!(typeof API.draw === "function")) throw mapRenderingError;
            for(let r=_minView.y; r < _maxView.y; r++) {
                for(let c=_minView.x; c < _maxView.x; c++) {
                    API.index = new Vector2(c, r);
                    API.id = API.array[r * API.dimension.x + c];
                    API.draw();
                }
            };
        };

        return API;

    });

    Object.defineProperties(Canva2D.API, {
        TileMap: {value: TileMap}
    });

}; 