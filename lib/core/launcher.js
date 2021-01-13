;{

    /**
     * Launcher is a display screen that shows information's and logo
     * then disappers after sometimes. 
     * 
     * @var Launcher 
     * @description creates a launcher screen
     * @param {Object} config launcher's settings
     * 
     * config = {element, width, height, fontSize, timeOut, fontFamily}
     *  - config.element is the graphics for the launcher, this could be an HTMLDivElement
     *    if not element is added to the config keys, then Launcher uses the default
     * - config.height is the height of the launcher
     * - config.width is the width of the launcher
     * - config.fontSize(optional) : only when default config.element is use, set the fontSize
     *   of the launcher
     * - config.fontFamily(optional) : only when default config.element is use, set the fontSize
     *   of the launcher
     * - config.timeOut: boolean - set when the launcher should disapears
     * 
     * @returns {Promise} 
     * 
     * USAGE: 
     * let l = Canva2D.API.Launcher(config);
    */

    const {DEFAULT} = Canva2D.API;

    const Launcher = function(_element=DEFAULT, config={}) {
        
        let element = _element === DEFAULT ? document.createElement("CANVAS") : _element;
        if(_element === DEFAULT) {
            config.width = config.width || innerWidth;
            config.height = config.height || innerHeight;
            element.width = config.width;
            element.height = config.height;
            element.style.backgroundColor = config.theme === "dark" ? "#222" : "#fff";
        };
        element.id = "canva2d-launcher";
        element.style.position = "absolute";
        element.style.zIndex = "2000";
        document.body.insertBefore(element, document.body.childNodes[0]);
        
        let fontSize = config.fontSize || 35;
        let fontFamily = config.fontFamily || "Verdana";
        
        if(_element === DEFAULT) {
            let ctx = element.getContext("2d");
            // draw logo
            ctx.beginPath();
            ctx.moveTo(config.width/2, config.height/2 - 20);
            for(let i=0; i <= 360; i+=60) {
                let angle = Math.degToRad(i);
                let radius = fontSize * 3;
                let x = config.width/2 + Math.cos(angle) * radius;
                let y = (config.height/2 - 20) + Math.sin(angle) * radius;
                ctx.lineTo(x, y);
            }
            ctx.fillStyle = config.theme === "dark" ? "#333" : "dimgray";
            ctx.fill();            
            // bat text
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = config.theme === "dark" ? "dimgray" : "#fff";
            ctx.fillText("Canva2D", config.width/2, config.height/2 - 20);
            // bat description
            ctx.font = `bold ${fontSize - (fontSize-10)}px ${fontFamily}`;
            ctx.fillStyle = config.theme === "dark" ? "dimgray" : "lightgray";
            ctx.fillText("Games API for web developers", config.width/2, config.height/2 + 20);
            // copyright
            ctx.font = `bold 10px ${fontFamily}`;
            ctx.fillStyle = config.theme === "dark" ? "#fff" : "#222";
            ctx.fillText("Mirielle "+new Date().getFullYear(), config.width/2, config.height - 50);
        }
        
        
        return new Promise(resolve => {
            setTimeout(() => {
                document.body.removeChild(element);
                resolve({status:"done", timeOut:config.timeOut || 5000});
            }, config.timeOut || 5000);
        });
    };

    Object.defineProperty(Canva2D.API, "Launcher", {value: Launcher});

};