/**
* @class Preloader
* Principal class for preloading objects
*/
Canva2D.API.Preloader = class Preloader {
    
    /**
    * @static loadImage
    * @description load a single image
    * @params {Image} img image to be preloaded
    * @params {String} str source of the image
    * @returns {Promise} the promise state of the image
    */
    static loadImage(img, src="") {
        return new Promise((resolve, reject) => {
            img.onload = () => {
                resolve({img:img, status:"loaded", src:img.src});
            };
            img.onerror = () => {
              reject({status:"failed", message:`failed to load ${img.src}`});
            };
            if(img.src !== "") img.src = img.src;
            else img.src = src;
        });
    }
    
    /**
    * @static loadImages
    * @description load multiple single images
    * @params {Array} imgData containing data of the images to be preloaded.
    * imgData = [{img, src}]
    * @returns {Promise} the promise state of all the images
    */
    static loadImages(imgData){
        let res = [];
        imgData.forEach(data => {
           let preloader = Preloader.loadImage(data.img, data.src);
            res.push(preloader);
        });
        return Promise.all(res);
    }
    
    /**
    * @static loadAudio
    * @description load a single audio object
    * @params {Audio} aud audio to be preloaded
    * @params {String} str source of the audio
    * @returns {Promise} the promise state of the image
    */
    static loadAudio(aud, src="") {
        let promise = new Promise((resolve, reject) => {
            if(aud.src === "" && src !== "") 
                aud.src = src;
            else if(aud.src === "" && src === "")
                reject({status:"Failed", message:"Invalid Audio source"});
            aud.load();
            aud.addEventListener("canplaythrough", e => {
                resolve({aud:aud, status:"loaded", src:aud.src});
            });
            aud.addEventListener("error", e => {
                reject({status:"Failed", message:`failed to load ${aud.src}`});
            });
        });
        return promise;
    }
    
    /**
    * @static loadAudios
    * @description load multiple audio objects
    * @params {Array} audData data of all the audios to be preloaded
    * audData = [{aud, src}]
    * @returns {Promise} the promise state of the audios
    */
    static loadAudios(audData){
        let res = [];
        audData.forEach(data => {
           let preloader = Preloader.loadAudio(data.aud, data.src);
            res.push(preloader);
        });
        return Promise.all(res);
    }
    
    /**
    * @static loadFile
    * @description load a single file remotedly
    * @params {Object} data info of the file
    * data = {src, res}
    * @returns {Promise} the promise state of the file
    */
    static loadFile(data) {
        return new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if(req.readyState === XMLHttpRequest.DONE) {
                    if(req.status === 200) {
                        data.res = req.responseText;
                        resolve({status:"loaded", src:data.src, ...data});
                    } else 
                        reject({status:"failed", src:data.src, message:"No Internet Connection"});
                }
            };
            req.onerror = () => {
                reject({status:"failed", src:data.src, message:"Something went wrong"});
            }
            req.open("GET", data.src);
            req.send();
        });
    }
    
    /**
    * @static loadFiles
    * @description load a multiple file remotedly
    * @params {Array} fileData info of the files
    * fileData = [{src, res}]
    * @returns {Promise} the promise state of the file
    */
    static loadFiles(fileData){
        let res = [];
        fileData.forEach(data => {
           let preloader = Preloader.loadFile(data);
            res.push(preloader);
        });
        return Promise.all(res);
    }
    
    /**
    * @constructor
    * @params {Array} assets to be loaded
    * assets = [{src, name, type}, {src, name, type, res}]
    **/
    constructor(assets) {
        this._assets = assets;
        this._images = [];
        this._audios = [];
        this._files = [];

        this._assets.forEach(asset => {
            // images
            if(['.jpg', '.png', '.jpeg', '.gif'].some(i => asset.src.endsWith(i)) || asset.type !== undefined && asset.type === "img" || asset.type === "image") {
                let img = {img: asset.img === undefined ? new Image(): asset.img, ...asset}
                this._images.push(img);
            }
            // audio
            if(['.mp3', '.ogg', '.wav'].some(i => asset.src.endsWith(i)) || asset.type !== undefined && asset.type === "aud" || asset.type === "audio") {
                let aud = {aud: asset.aud === undefined ? new Audio(asset.src):asset.aud, ...asset}
                this._audios.push(aud);
            }
            // files
            else if(['.json', '.txt', '.obj'].some(i => asset.src.endsWith(i)) || asset.type !== undefined && asset.type === "other" || asset.type === "file") {
                let file = {file:"", ...asset}
                this._files.push(file);
                
            }
        });
    }
    
    /**
    * @method getMedia
    * @description get a media by name from this preloader
    * @param {String} name of the media
    * @param {String} type of the media
    * @return {Any}
    */
    getMedia(name, type) {
        if(type === "aud" || type === "audio")
            return this._audios.filter(i => i.name === name)[0].aud;
        else if(type === "img" || type === "image")
            return this._images.filter(i => i.name === name)[0].img;
        else if(type === "file" || type === "other")
            return this._files.filter(i => i.name === name)[0].res;
    }
    
    /**
    * @method load
    * @description load all assets
    */
    async load() {  
        let images, audios, files, _this=this;
        const _DEFMSG = {status:"loaded", message:"Empty file to Load"};
        // img
        if(this._images.length !== 0)
            images = await Preloader.loadImages(this._images);
        else images = await Promise.resolve(_DEFMSG);
        // aud
        if(this._audios.length !== 0) 
            audios = await Preloader.loadAudios(this._audios, this._counter);
        else audios = await Promise.resolve(_DEFMSG);
        // files
        if(this._files.length !== 0) 
            files = await Preloader.loadFiles(this._files);
        else files = await Promise.resolve(_DEFMSG);
        let res = {images: this._images, audios: this._audios, files: this._files, getMedia:this.getMedia};
        return await Promise.all([images, audios, files]).then(e => res);
    }
    
};