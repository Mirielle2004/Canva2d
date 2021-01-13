let g, ctx, map, mapFunc, camera;


function gameLoop() {
    ctx = this.getContext("2d");
    ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
    
    camera.lookAt(map);
    map.render(0, 3);
};


function drawWorld() {
    let pos = this.index.mult(this.size);
    if(this.id === 0) {
        let pos = this.index.mult(this.size);
        ctx.fillStyle = "navy";
        ctx.fillRect(pos.x, pos.y, this.size.x, this.size.y);
    } else if(this.id === 1) {
        ctx.fillStyle ="green";
        ctx.fillRect(pos.x, pos.y, this.size.x, this.size.y);
        ctx.strokeStyle ="#222";
        ctx.strokeRect(pos.x, pos.y, this.size.x, this.size.y);
    };
};


const main = () => {
    g = Canva2D.getAPI();
    let scene = g.Scene(innerWidth, innerHeight, true);
    scene.update = gameLoop;

    map = g.TileMap(g.ORTHORGONAL, levelMap, [40, 15], [64, 64]);
    map.draw = drawWorld;

    camera = g.Camera(g.ORTHORGONAL, 0, 200);

    scene.play();
};

addEventListener("load", main);