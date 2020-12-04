const Launcher = function(config) {
    
    let element = config.element === undefined ?document.createElement("CANVAS") : config.element;
    if(config.element === undefined) {
        element.width = config.width || 300;
        element.height = config.height || 300;
        element.style.backgroundColor = config.theme === "dark" ? "#222" : "#fff";
    };
    element.id = "launcher";
    element.style.position = "absolute";
    element.style.zIndex = "2000";
    document.body.insertBefore(element, document.body.childNodes[0]);
    
    let fontSize = config.fontSize || 35;
    let fontFamily = config.fontFamily || "Verdana";
    
    if(config.element === undefined) {
        let ctx = element.getContext("2d");
        // draw logo
        ctx.beginPath();
        ctx.moveTo(config.width/2, config.height/2 - 20);
        for(let i=0; i <= 360; i+=60) {
            let angle = i * Math.PI / 180;
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
        ctx.fillStyle = "red";
        ctx.fillText("Games API for web developers", config.width/2, config.height/2 + 20);
        // copyright
        ctx.font = `bold 10px ${fontFamily}`;
        ctx.fillStyle = config.theme === "dark" ? "#fff" : "#222";
        ctx.fillText("Mirielle "+new Date().getFullYear(), config.width/2, config.height - 50);
    }
    
    
    return new Promise(resolve => {
        setTimeout(() => {
            document.body.removeChild(element);
            resolve({status:"Loaded"});
        }, config.timeOut || 5000);
    });
};