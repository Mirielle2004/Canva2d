;{

    /**
     * @function preloader
     * @description preloads media assets (image, audios, files)
     * @param  {...any} arg variable length arguments for the preloader
     * @returns {Promise} the promise state of the preloader
     */
    const Preloader = (function(...arg) {

        if(arg.length <= 1) 
            throw new Error("No Preloading assets Found");

        let _IMAGES_STACK = [],
            _AUDIOS_STACK = [],
            _FILES_STACK = [], 
            alpha = [];

        for(let i=65; i <= 122; i++) 
            alpha.push(String.fromCodePoint(i));
        
        /**
         * @function getName
         * @description retrieve the name of a media from it's source link
         * @param {String} source source of the media
         * @returns {String} the name of the media
         * 
         * source = "hlfllldfff.kdfkkdfl.//dfldfldflf/.google.com"
         * output = google
         */
        function getName(source) {
            let start = source.lastIndexOf(".");
            let name = "";
            while(alpha.includes(source[start - 1])) {
                start--;
                let currentChar = source[start];
                name += currentChar;
            };
            return name.split("").reverse().join("");
        };

        const getAudio = name => _AUDIOS_STACK.find(i => i.name === name).aud;
        const getImage = name => _IMAGES_STACK.find(i => i.name === name).img;
        const getFile = name => _FILES_STACK.find(i => i.name === name);


        function loadImage() {
            let _img;
            // check if the parameters is just an image src;
            if(arg.length === 2 && typeof arg[1] === "string") {
                _img = new Image();
                _img.src = arg[1];
            } else  _img = arg[1];
            return new Promise((resolve, reject) => {
                _img.addEventListener("load", e => {
                    let name = getName(_img.src);
                    resolve({img:_img, name});
                });
                _img.addEventListener("error", e => {
                    reject({status:"Failed", message:"Failed to Load Image: Something went Wrong", 
                        img:_img});
                });
                if(_img.src === "" && arg[2] !== undefined)
                    _img.src = arg[2];
                if(_img.src === "" && arg[2] === undefined)
                    reject({status:"Failed", message:"No Valid Source", img:_img});
            });
        };

        /**
         * Accepts all arguments as an image sources
         */
        async function loadImages() {
            let data = arg.splice(1, arg.length - 1);
            let promise = [];
            data.forEach(img => {
                if(typeof img === "string") {
                    let image = Canva2D.API.Preloader("singleImageOnly", img);
                    promise.push(image);
                } else if(img.hasOwnProperty("img") && img.hasOwnProperty("src")) {
                    let image = Canva2D.API.Preloader("singleImageOnly", img["img"], img["src"]);
                    promise.push(image);
                } else {
                    let image = Canva2D.API.Preloader("singleImageOnly", img);
                    promise.push(image);
                }
            });
            return await Promise.all(promise).then(e => {
                for(const img of e) 
                    _IMAGES_STACK.push(img);
                return _IMAGES_STACK;
            }).then(e => getImage);
        };


        function loadAudio() {
            let _aud;
            // check if the parameters is just an audio src;
            if(arg.length === 2 && typeof arg[1] === "string") {
                _aud = new Audio();
                _aud.src = arg[1];
                _aud.load();
            } else  _aud = arg[1];
            return new Promise((resolve, reject) => {
                _aud.addEventListener("canplay", e => {
                    let name = getName(_aud.src);
                    resolve({aud:_aud, name});
                });
                _aud.addEventListener("error", e => {
                    reject({status:"Failed", message:"Failed to Load Audio: Something went Wrong", 
                        aud:_aud});
                });
                if(_aud.src === "" && arg[2] !== undefined) {
                    _aud.src = arg[2];
                    _aud.load();
                }
                if(_aud.src === "" && arg[2] === undefined)
                    reject({status:"Failed", message:"No Valid Source", aud:_aud});
            });
        };

        // argument (aud) || (aud, src) || src
        async function loadAudios() {
            let data = arg.splice(1, arg.length - 1);
            let promise = [];
            data.forEach(aud => {
                if(typeof aud === "string") {
                    let audio = Canva2D.API.Preloader("singleAudioOnly", aud);
                    promise.push(audio);
                } else if(aud.hasOwnProperty("aud") && aud.hasOwnProperty("src")) {
                    let audio = Canva2D.API.Preloader("singleAudioOnly", aud["aud"], aud["src"]);
                    promise.push(audio);
                } else {
                    let audio = Canva2D.API.Preloader("singleAudioOnly", aud);
                    promise.push(audio);
                }
            });
            return await Promise.all(promise).then(e => {
                for(const aud of e) 
                    _AUDIOS_STACK.push(aud);
                return _AUDIOS_STACK;
            }).then(e => getAudio);
        };

        // coming soon
        function loadFile() {

        };

        // coming soon
        function loadFiles() {

        };


        class LoadAll {
            constructor() {
                let _data = arg.splice(1, arg.length - 1);
                let imgExtension = [".jpg", ".png", ".gif", ".jpeg"];
                let audioExtension = [".mp3", ".ogg"];
                let fileExtension = [".txt", ".json", ".obj"];

                let [images, audios, files] = [[], [], []];

                _data.forEach(data => {
                    if(typeof data === "string" && imgExtension.some(i => data.endsWith(i)) ||
                    typeof data === "object" && imgExtension.some(i => data.src.endsWith(i)) || 
                    data.type !== undefined && data.type === "img") {
                        let img = new Image();
                        img.src = typeof data === "string" ? data : data.src;
                        let name = getName(img.src);
                        images.push({img, name});
                    } else if(typeof data === "string" && audioExtension.some(i => data.endsWith(i)) ||
                    typeof data === "object" && audioExtension.some(i => data.src.endsWith(i)) || 
                    data.type !== undefined && data.type === "aud") {
                        let audio = new Audio()
                        audio.src = typeof data === "string" ? data : data.src;
                        let name = getName(audio.src);
                        audios.push({aud:audio, name});
                    } else if(typeof data === "string" && fileExtension.some(i => data.endsWith(i)) ||
                    typeof data === "object" && fileExtension.some(i => data.src.endsWith(i)) || 
                    data.type !== undefined && data.type === "file") {
                        let src = typeof data === "string" ? data : data.src;
                        files.push(src);
                    }
                });

                async function loadImages() {
                    let _images = [];
                    images.forEach(data => {
                        let promise = new Promise((resolve, reject) => {
                            data.img.addEventListener("load", e => {
                                resolve("loaded");
                            });
                            data.img.addEventListener("error", e => reject(`eRROR`));
                        });
                        _images.push(promise);
                    });
                    return await Promise.all(_images);
                };

                async function loadAudios() {
                    let _audios = [];
                    audios.forEach(data => {
                        data.aud.load();
                        let promise = new Promise((resolve, reject) => {
                            data.aud.addEventListener("canplay", e => resolve("loaded"));
                            data.aud.addEventListener("error", e => reject("error"));
                        });
                        _audios.push(promise);
                    });
                    return await Promise.all(_audios);
                };

                async function loadFiles() {
                    let _files = [];
                    files.forEach(file => {
                        let promise = new Promise((resolve, reject) => {
                            resolve(5);
                        });
                        _files.push(promise);
                    });
                    return await Promise.all(_files);
                }

                function getMedia(name, type="img") {
                    if(type === "img")
                        return images.find(i => i.name === name).img;
                    else if(type === "aud") 
                        return audios.find(i => i.name === name).aud;
                    else if(type === "file")
                        return audios.find(i => i.name === name).file;
                };

                async function loadAllAssets() {
                    let _images = await loadImages();
                    let _audios = await loadAudios();
                    let _files = await loadFiles();
                    return await Promise.all([_images, _audios, _files])
                    .then(e => getMedia);
                };

                this.loadAllAssets = loadAllAssets;

            }
        };
        
        switch(arg[0]) {
            case "singleImageOnly":
                return loadImage();
            case "multipleImagesOnly":
                return loadImages();
            case "singleAudioOnly":
                return loadAudio();
            case "multipleAudiosOnly":
                return loadAudios();
            case "singleFileOnly":
                return loadFile();
            case "multipleFilesOnly":
                return loadFiles();
            case "allFiles":
                return new LoadAll().loadAllAssets();
            default:
                throw new Error("Preloader expects Loading Mode as it's first argument");
        };

    });


    Object.defineProperties(Canva2D.API, {
        LOAD_IMAGE: {value: "singleImageOnly", writable:false},
        LOAD_IMAGES: {value: "multipleImagesOnly", writable:false},
        LOAD_AUDIO: {value: "singleAudioOnly", writable:false},
        LOAD_AUDIOS: {value: "multipleAudiosOnly", writable:false},
        LOAD_FILE: {value: "singleFileOnly", writable:false},
        LOAD_FILES: {value: "multipleFilesOnly", writable:false},
        LOAD_ALL: {value: "allFiles", writable: false},
        Preloader: {value: Preloader, writable: false},
    });

};