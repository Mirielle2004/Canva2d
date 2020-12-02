let g = Canva2d;


g.load([
    "launcher"
]);



const init = () => {
        
    let config = {
        theme: "dark",
        width: innerWidth,
        height: innerHeight
    };
    Launcher(config).then(e => {
        console.log("done");
    });
    
};

addEventListener("load", init);