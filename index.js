let g = Canva2d;
g.load(['preloader','scene','launcher']);


let assets = [
    {src:"example/img/hero.png", name:"hero1"},
    {src:"example/img/hero.png", name:"hero2"},
    {src: 'example/french.mp3', name:"music1"},
    {src: 'example/french.mp3', name:"musi2"},
];

let img;


const init = () => {
        
    let config = {
        theme: "dark",
        width: innerWidth,
        height: innerHeight,
        timeOut: 3000,
    };
    
    let preload = new Preloader(assets);
    
    let scene = new Scene(innerWidth, innerHeight, true);
    scene.update = function() {
        let ctx = this.getContext();
        ctx.fillRect(100, 100, 100, 100);
        ctx.drawImage(img, 200, 100);
    };
    
    Launcher(config).then(e => {
        g.$("#loading").innerHTML = 'Loading...';
        preload.load().then(e => {
            g.$("#loading").style.display = 'none';
            img = e.images[0].img;
            scene.start();
            console.log("touch the screen to play sound");
            addEventListener("touchstart", ()=>{
                e.audios[0].aud.play();
            });
        });
    });
    
};

addEventListener("load", init);