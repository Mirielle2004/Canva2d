/**
 * @description principal class for a 2D Camera's object
 * 
 */
class Camera extends Vector {
    /**
     * @constructor
     * @param {Number} x starting position of the camera in the X-axis
     * @param {Number} y starting position of the camera in the Y-axis
     * @param {Number} w ending position of the camera in the X-axis
     * @param {Number} h ending position of the camera in the Y-axis
     * 
     */
    constructor(x = 0, y = 0, w = 0, h = 0) {
        super(x, y);
        this.w = w;
        this.h = h;

        // follow up camera mostly in a tiled base game's maximum and minimum location
        this.maxDimension = new Vector(0, 0);
    }

    follow(component) {
        if(this.maxDimension.y === 0 && this.maxDimension.x === 0)
            throw new Error("Please provide the maximum dimension for the camera");
        
       // get the camera position from the centre of the player
        let cameraPos = new Vector(component.getCenterX(),
                component.getCenterY()).subtract({
                x: this.w * .5, y: this.h * .5});
                    
        // set camera to the center of the player
        this.x = cameraPos.x;
        this.y = cameraPos.y;

        // stop moving the camera if it is less than 0 or greater than the mapSize on the X-axis
        this.x = Math.min(Math.max(0, this.x), Math.min(
            this.maxDimension.x - this.w, Math.max(0, cameraPos.x)));

        // stop moving the camera if it is less than 0 or greater than the mapSize on the Y-axis
        this.y = Math.min(Math.max(0, this.y), Math.min(
            this.maxDimension.y - this.h, Math.max(0, cameraPos.y)));
    }
}
