; {

    const createException = ((name, message) => {
        class NewException extends Error {
            constructor(message) {
                super(message);
                this.name = name;
            }
        };
        return new NewException(message);
    });

    // exception thrown when tilemap have no defined draw function
    Canva2D.API.mapRenderingError = createException("MapRenderingError", 
        "this.draw function could not be found");

    // exception thrown when tilemap instance creation failed
    Canva2D.API.tileMapError = createException("TileMapError", 
        "Failed to create TileMap");

    // exception thrown when camera instance creation failed
    Canva2D.API.cameraError = createException("CameraError", 
        "Failed to create Camera");


};