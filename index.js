let g, ctx, graph;

const {E:nat, log, sinh, sin} = Math;
/**
 * Edit by Adding/Removing functions to this variable to modify the graph.
 * NOTE: this function must return a value and note it's syntax
 * Also note that this code computes functions from the smallest -X to X
 */
const functions = {
    sinHFunc: x => [sinh(x * 0.05) * 50, "teal"],
    logEFunc: x => [log(x) * 50, "green"],
    sinFunc: x => [Math.sin(x * nat) * 50, "navy"],
};


const createGraph = (function(boxSize) {
    let [W, H] = [innerWidth, innerHeight];
    let graph = {};
    graph.tileSize = boxSize;
    graph.subTileLength = 10;
    graph.subTileSize = ~~(graph.tileSize / graph.subTileLength);
    graph.subTileDimension = new g.Vector2(10);

    let colX = ~~(W / graph.tileSize);
    let colY = ~~(H / graph.tileSize);

    graph.column = !(colX % 2) ? colX : colX - 1;
    graph.row = !(colY % 2) ? colY : colY - 1;
    graph.dimension = new g.Vector2(graph.column, graph.row);
    graph.size = graph.dimension.scale(graph.tileSize);
    graph.offSet = new g.Vector2(W, H).sub(graph.size);

    graph.color = {
        origin: "red",
        subTile: "red",
        background:"#222",
    };

    graph.middle = graph.size.scale(0.5);

    graph.drawLine = (ctx, tPos, pos, color, width=1) => {
        tPos = new g.Vector2(tPos);
        pos = new g.Vector2(pos);
        ctx.save();
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(tPos.x, tPos.y);
        ctx.lineTo(tPos.x + pos.x, tPos.y + pos.y);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.restore();
    };

    graph.coord = function(pos) {
        pos = new g.Vector2(300, 20);
        let x = this.middle.x + pos.x;
        let y = this.middle.y + pos.y;
        return {x, y};
    };

    graph.drawFunction = function()  {
        for(const func in functions) {
            for(let i=-this.middle.x, c=0; i < this.middle.x; i++, c++) {
                let call = functions[func](i);
                let x = i;
                let y = call[0];
                let color = call[1];
                let pos = new g.Vector2(x+this.middle.x, y + this.middle.y);
                if(c < 1) {
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                } else 
                    ctx.lineTo(pos.x, pos.y);
                ctx.strokeStyle = color;
                ctx.stroke();
            };
        };
    };

    graph.drawBackground = function(ctx) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.color["subTile"];
        for(let row=0; row < this.row; row++) {
            for(let col=0; col < this.column; col++) {
                let pos = new g.Vector2(col, row).scale(this.tileSize);
                ctx.strokeRect(pos.x, pos.y, this.tileSize, this.tileSize);
                ctx.save();
                ctx.lineWidth = 1;
                for(let row=0; row < this.subTileLength; row++) {
                    for(let col=0; col < this.subTileLength; col++) {
                        let subPos = pos.add(new g.Vector2(col, row).scale(this.subTileSize));
                        ctx.strokeRect(subPos.x, subPos.y, this.subTileSize, this.subTileSize);
                    };
                };
                ctx.restore();
            };
        };
    };

    return graph;
});

const drawLine = (ctx, tPos, pos, color, width=1) => {
    tPos = new g.Vector2(tPos);
    pos = new g.Vector2(pos);
    ctx.save();
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(tPos.x, tPos.y);
    ctx.lineTo(tPos.x + pos.x, tPos.y + pos.y);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
};


const text = (txt, pos) => {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "20px Verdana";
    ctx.fillText(txt, pos.x, pos.y);
};

function graphLoop() {
    ctx = this.getContext("2d");
    graph.drawFunction();
};


function graphBackgroundFunc() {
    let ctx = this.getContext("2d");
    graph.drawBackground(ctx);
    drawLine(ctx, [graph.middle.x, 0], [0, graph.size.y], 
        graph.color["origin"], 4);
    drawLine(ctx, [0, graph.size.y/2], [graph.size.x, 0], 
        graph.color["origin"], 4);
};


const main = () => {
    g = Canva2D.getAPI();
    graph = createGraph(50);
    const [W, H] = [graph.size.x, graph.size.y];
    let styles = {
        position: "absolute",
        left: `${innerWidth/2 - W/2}px`,
        top: `${innerHeight/2 - H/2}px`
    };
    let backgroundScene = g.Scene(W, H, false);
    backgroundScene.update = graphBackgroundFunc;
    backgroundScene.css(styles);
    backgroundScene.play();
    let scene = g.Scene(W, H, false);
    scene.css(styles);
    scene.update = graphLoop;
    scene.play();
};

addEventListener("load", main);