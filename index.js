let g = Canva2d;


g.load([
    'preloader',
    'scene',
    'launcher'

]);


let img = new Image();
img.src = "example/img/hero.png";

let aud = new Audio();
aud.src = "example/french.mp3";



let assets = [
    {img:img, src:img.src, name:"hero"},
    {aud: aud, src:aud.src},
//    {src:"jjj", type:"other"}
]



const init = () => {
        
    let config = {
        theme: "dark",
        width: innerWidth,
        height: innerHeight
    };
    
    let preload = new Preloader(assets);
    
    let scene = new Scene(innerWidth, innerHeight, true);
    scene.update = function() {
        let ctx = this.getContext();
        ctx.fillRect(100, 100, 100, 100);
    };
    scene.start();
    
};

addEventListener("load", init);