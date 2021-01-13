; {

    const {ORTHORGONAL, ISOMETRIC, Vector2, cameraError} = Canva2D.API;

    const camera = (function(type, pos, dimension) {
        let API = {};
        switch(type) {
            case ORTHORGONAL:
                // do something;
                break;
            case ISOMETRIC:
                // do something
                break;
            default:
                throw cameraError;
        };

        API.pos = new Vector2(pos);
        API.dimension = new Vector2(dimension);
        API.lookAt = (map, tileSize) => {
            let _map;
            if(map.array === undefined)  {
                if(!(map instanceof Array)) {
                    cameraError.message = "Lookat object must be an instance of a tileMap or an array";
                    throw cameraError;
                }
            };
            API.map = map;
        };
        API.getView = function() {
            // let x_min = API.pos.scale()
        };

        return API;

    });

    Object.defineProperty(Canva2D.API, "Camera", {value: camera});
};