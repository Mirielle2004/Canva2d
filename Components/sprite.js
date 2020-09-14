/**
 * @description draw sprite on the canvas
 */
class Sprite extends Component {

    /**
     * @constructor
     * @param {Number} x position of the sprite on the X-axis
     * @param {Number} y position of the sprite on the Y-axis
     * @param {Number} w width of the sprite
     * @param {Number} h height of the sprite
     * @param {TileSet} data tileset containing tile's info relating with the sprite
     * @param {String} frame name of the animation frame
     * @param {Number} delay speed of the animation
     * 
     * */
    constructor(x, y, w, h, data, frame, delay=0) {
        super({x, y, w, h});
        this.data = data;   // TileSet Object

        this.img = this.data.img;
        this.tileW = this.data.w;
        this.tileH = this.data.h;
        this.spacing = this.data.spacing;
        
        this.frame = this.data.frame.filter(i => i.name === frame)[0];
        this.frameName = "";
        this.currentFrame = [];
        this.frameIndex = 0;
        
        for(const name in this.frame)
            this.setFrame(name);

        this.src = new Vector(undefined, undefined);
        
        this.delay = delay;
        this.maximumDelay = delay;
    }

    /**
     * @description change animation's frame for the sprite
     * @param {String} key The name of the frame
     * 
     */
    setFrame(key) {
        this.frameName = key;
        if(this.frame[key] === undefined) 
            throw new Error(`"${key}" is not a valid frame's name`);
        this.currentFrame = this.frame[key];
    }

    /**
     * @returns The name of the current frame
     */
    getFrame() {
        return this.frameName;
    }

    /**
     * @description get the source X and Y value for the current frame
     */
    animate() {
        if(this.currentFrame.length < 1 || !(this.currentFrame instanceof Array)) 
            throw new Error(`Current Animation's Frame does not exist`);

        this.delay--;
        if(this.delay < 0) {
            this.delay = this.maximumDelay;
            this.frameIndex++;
            if(this.frameIndex >= this.currentFrame.length)
                this.frameIndex = 0;
            let value = this.currentFrame[this.frameIndex] - 1;
            this.src = this.data.getIndex(value);
        }
    }

    draw(callback = null) {
        this.animate();
        if(typeof callback === "function") 
            callback();
        else 
            CURRENT_CONTEXT.drawImage(this.img, this.src.x * this.data.w, 
                this.src.y * this.data.h, this.data.w, this.data.h, this.x, 
                this.y, this.w, this.h);
    }

};
