let ctx, TSB, gSwipe, preload;

// Tetrominos common buffers
const TETROMINOS_STATIC_BUFFER = {
    index: new Vector2(10,21),
    screen: null,
    active: [],
    nextPiece: [],
    array: [],
    graphic: {
        stroke: "#222",
        fill: "white",
        array:[],
        tetriminos:[
            [[1,1],[1,1]], [[0,1,0],[0,1,0],[1,1,0]],[[0,1,0],[0,1,1],[0,1,0]],[[0,1,0],[0,1,0],[0,1,0]],[[0,1,0],[0,1,0],[0,1,1]],[[1,1,0],[0,1,1],[0,0,0]],[[0,1,1],[1,1,0],[0,0,0]]
        ]
    },
    tileS: 20,
    tileSize: 20,
    initArray() {
        for(let i=0; i < this.index.y; i++) {
            this.array.push(new Array(this.index.x).fill(0));
            this.graphic.array.push(new Array(this.index.x).fill(0));
        }
    },
    init() {
        let size = ~~(innerWidth / 15);
        this.tileS = size;
        this.tileSize = size;
        this.index.y = ~~((innerHeight - 100) / size);
        this.screen = Vector2.createFrom(this.index).scale(this.tileSize);
        this.initArray();
    }
};


const game = {
    level: null,
    cleared: null,
    score: null,
    interval: null,
    isPlaying: false,
    startTime: null,
    isOver: null,
    scores: new Set(),
    highScore: 0,
    over() {
        this.isOver = true;
        this.isPlaying = false;
        Utils.$("#preloader").innerHTML = "";
        Utils.$("#gOver").innerHTML = "Game Over";
        Utils.$("#start-screen").style.display = "block";
    },
    start() {
        if(!this.isPlaying) {
            TSB.array = [];
            TSB.graphic.array = [];
            TSB.active = [];
            TSB.nextPiece = [];
            TSB.initArray();
            this.level = 0;
            this.cleared = 0;
            this.scores.add(this.score);
            this.score = 0;
            this.interval = 1000;
            this.isOver = false;
            Utils.$("#gOver").innerHTML = "";
            Utils.$("#start-screen").style.display = "none";
            this.startTime = new Date().getTime();
            TetriMinos.create();
            this.isPlaying = true;
        }
    }
};

console.log = () => {};
console.error = () => {};
onerror = () => {};

// get random numbers between min - max, useful for getting the start location for a new Tetriminos
const max_min = (max, min) => Math.floor(Math.random() * (max - min + 1) + min);


// Principal class For the Tetriminos
class TetriMinos {

    // create a new Tetriminos
    static create() {
        let color = ["red", "green", "blue", "teal"];
        let go = TSB.nextPiece.length < 1 ? 2 : 1;
        for(let i=0; i < go; i++) {
            let tet = new TetriMinos([0,0], Utils.randFromArray(color));
            tet.pos = Vector2.createFrom({
                x: max_min(TSB.index.x - tet._tetriminos.length, tet._tetriminos.length),
                y: 0
            });    
            TSB.nextPiece.push(tet);
        };
        
        let tet = TSB.nextPiece.shift();
        tet.pos.y = 0;
        let hasCollided = false;
        for(let i=0; i < tet._tetriminos.length; i++) {
            for(let j=0; j < tet._tetriminos[i].length; j++) {
                let pos = {x: ~~(tet.pos.x + j), y:~~(tet.pos.y+i)};
                if(TSB.array[pos.y][pos.x] !== 0) {
                    hasCollided = true;
                }
            }
        };
        if(hasCollided) {
            TSB.active.push(tet);
            game.over();
        } else {
            tet._startTime = new Date().getTime();
            TSB.active.push(tet);
        };
    }
    
    static draw(pos, color, type="fill", _ctx=ctx, size=null, _grd=false) {
        if(type === 'fill') {
            let grd = _ctx.createRadialGradient(pos.x + TSB.tileS/2, pos.y + TSB.tileS/2, 0, pos.x, pos.y, TSB.tileS);
            grd.addColorStop(0, "lightgray");
            grd.addColorStop(1, color);
            _ctx.fillStyle = _grd ? grd : color;
            if(size !== null) _ctx.fillRect(pos.x, pos.y, size, size);
            else _ctx.fillRect(pos.x, pos.y, TSB.tileS, TSB.tileS);
        } else {
            _ctx.strokeStyle = color;
            if(size !== null) _ctx.strokeRect(pos.x, pos.y, size, size);
            else _ctx.strokeRect(pos.x, pos.y, TSB.tileS, TSB.tileS);
        }
    }
    
    constructor(pos, color) {
        this.pos = Vector2.createFrom(pos);
        this._tetriminos = Utils.randFromArray(TSB.graphic.tetriminos);
        this._color = color;
        this._dimension = Vector2.createFrom(
        [this._tetriminos.length, this._tetriminos.length]
        ).scale(TSB.tileS);
        
        this.tiles = this.createTile(this._tetriminos);
        
        this._startTime = new Date().getTime();
    }
    
    createTile(tetriminos) {
        // create tile-pos;
        let res = [];
        for(let r=0; r < tetriminos.length; r++) {
            for(let c=0; c < tetriminos[r].length; c++) {
                let id = tetriminos[r][c];
                let pos = new Vector2(c, r).scale(TSB.tileS);
                if(id === 1) 
                    res.push(pos);
            }
        }
        return res;
    }
    
    draw() {
        let translated = this.pos.scale(TSB.tileS);  
        ctx.save();
        ctx.translate(translated.x, translated.y);
        this.tiles.forEach(pos => {
            TetriMinos.draw(pos, this._color, "fill", ctx, TSB.tileS, true);
            TetriMinos.draw(pos, TSB.graphic.stroke, "stroke");
        });
        ctx.restore();
    }
    
    rotate(clockwise=true) {
        let array = this._tetriminos;
        let rotatedArray = [];
        for(let r=0; r < array.length; r++) {
            rotatedArray.push([]);
            for(let c=0; c < array[r].length; c++) {
                let newVal = clockwise ? array[array.length-c-1][r]:array[c][array[c].length-1-r];
                rotatedArray[r].push(newVal);
            }
        }
        
        let oldTetriminos = this._tetriminos;
        let oldTiles = this.tiles;
        let newTetriminos = rotatedArray;
        let newTiles = this.createTile(newTetriminos);
        
        // rotate tiles and push their coords to a buffer
        let ROTATED_BUFFER = [];
        for(let i=0; i < newTiles.length; i++) {
            let oldPos = this.pos.scale(TSB.tileS).add(newTiles[i])
            ROTATED_BUFFER.push(oldPos);
        };
        
        // check for the index of each rotated buffer in the TSB array
        let collisionBuffer = [[],[]];
        for(let i=0; i < ROTATED_BUFFER.length; i++) {
            let newPos = ROTATED_BUFFER[i];
            let index = TileMap.indexAt(newPos, [TSB.tileS,TSB.tileS]);
            let value = TileMap.getId(TSB.array, index);
            collisionBuffer[0].push(index);
            collisionBuffer[1].push(value);
            
        };
        // do not rotate if any rotated tiles is not in the visible area of the tile game
        if(ROTATED_BUFFER.some(i => i.x < 0 || i.x > TSB.tileS * (TSB.index.x -1) || i.y < 0 || i.y > TSB.tileS * (TSB.index.y - 1)) || collisionBuffer[1].some(i => i !== 0)) {
            newTetriminos = oldTetriminos;
            newTiles = oldTiles;
        };
        
        this._tetriminos = newTetriminos;
        this.tiles = newTiles;
    }
    
    // this method checks if a tile has reached it's destination in the TSB array then set it's index to 1 and also save it's graphics color to the TSB.graphics.array and delete their tetriminos
    save() {
        for(let r=0; r < this._tetriminos.length; r++) {
            for(let c=0; c < this._tetriminos[r].length; c++) {
                let id = TileMap.getId(this._tetriminos, [c, r]);
                if(id === 1) {
                    let p = [this.pos.x + c,this.pos.y + r];
                    TileMap.setId(TSB.array, p, TSB.index.x, 1);
                    TileMap.setId(TSB.graphic.array, p, TSB.index.x, this._color);
                }
            }
        }
         TSB.active.splice(TSB.active.indexOf(this), 1);
    }
    
    update(currentTime) {
        let _this = this;
        TetriminosMove("down", this, {
            free() {
                if(Math.abs(currentTime - _this._startTime) >= game.interval - (game.level * 20)) {
                    _this.pos.y++;
                    _this._startTime = currentTime;
                }
            },
            block() {
                if(!game.isOver) {
                    _this.save();
                    TetriMinos.create();
                };
            }
        });
        this.draw();
    }
    
};


/** checks for each Tetriminos collision using the INVERSE COLLISION method
* The logic behind this is to filter every block in the tetriminos array and convert their indexes to screen space
then from screen space to their coordinate in the TSB array,
if the nextLocation of any tile in the filtered tetrominos is not 0, then collision has occur and they should stop right there
*/
const commonCheck = (tiles, tetriminos, colArray, _newPos) => {
    let collisionBuffer = [[],[],[],[]];
    for(let i=0; i < tiles.length; i++) {
        let currentPos = tetriminos.pos.scale(TSB.tileS).add(tiles[i]);
        let newPos = _newPos.add(tiles[i]);
        let index = new Vector2(~~(newPos.x/TSB.tileS), ~~(newPos.y/TSB.tileS));
        let value = colArray[Math.min(TSB.index.y-1, index.y)][index.x];
        collisionBuffer[0].push(currentPos);
        collisionBuffer[1].push(newPos);
        collisionBuffer[2].push(index);
        collisionBuffer[3].push(value);
            
    }
    return collisionBuffer;
};

const TetriminosMove = (dir, tetriminos, callback={}) => {
    let TSB = TETROMINOS_STATIC_BUFFER;
    let tiles = tetriminos.tiles;
    let colArray = TSB.array;
    
    if(dir === "left") {
        let collision = commonCheck(tiles, tetriminos, colArray, tetriminos.pos.scale(TSB.tileS).add([-TSB.tileS, 0]));
        if(collision[3].every(i => i === 0)) tetriminos.pos.x--;
    } else if(dir === "right") {
        let collision = commonCheck(tiles, tetriminos, colArray, tetriminos.pos.scale(TSB.tileS).add([TSB.tileS, 0]));
        if(collision[3].every(i => i === 0)) tetriminos.pos.x++;
    } else if(dir === "down") {
        let collision = commonCheck(tiles, tetriminos, colArray, tetriminos.pos.scale(TSB.tileS).add([0, TSB.tileS]));
        if(collision[3].every(i => i === 0) && collision[2].every(i => i.y <= TSB.index.y-1)) {
            if(typeof callback.free === "function")         callback.free();
            else tetriminos.pos.y++;
        } else {
            if(typeof callback.block === "function")
                callback.block();
        }
    }
};


function bgUpdate() {
    let ctx = this.getContext();
    
    let TSB = TETROMINOS_STATIC_BUFFER;
    ctx.strokeStyle = 'teal';
    ctx.strokeRect(0, 0, TSB.screen.x, TSB.screen.y);
    for(let i=0; i < TSB.index.y; i++) {
        for(let j=0; j < TSB.index.x; j++) {
            let id = TSB.array[i][j];
            let pos = new Vector2(j, i).scale(TSB.tileSize);
            if(id === 1) {
                TetriMinos.draw(pos, TSB.graphic.array[i][j], "fill", ctx, TSB.tileS, true);
                TetriMinos.draw(pos, TSB.graphic.stroke, "stroke", ctx);
            }
        }
    };
    // filled blocks
    let _filled = TSB.array.filter(i => i.every(j => j === 1));
    
    if(_filled.length !== 0) {
        let _filledDel = [];
    
        for(let r=0; r < TSB.index.y; r++) {
            let current = TSB.array[r];
            if(current.every(i => i !== 0)) {
                _filledDel.push(r);
            }
        };
        
        for(let i=0; i < _filledDel.length; i++) {
            TSB.array.splice(_filledDel[i], 1);
            TSB.graphic.array.splice(_filledDel[i], 1);
            TSB.array.unshift(new Array(TSB.index.x).fill(0));
            TSB.graphic.array.unshift(new Array(TSB.index.x).fill(0));
        }
        game.cleared += _filledDel.length;
    };
    game.score = TSB.array.flat().filter(i => i !== 0).length + (game.cleared * TSB.index.x);
};


function gameUpdate() {
    
    if(Math.abs(this.currentTime - game.startTime) >= 1000)
        TSB.active.forEach(t => t.update(this.currentTime));
    
    
    ctx.strokeStyle = "teal";
    let rect = {
        x: TSB.screen.x + TSB.tileS,
        y: innerHeight/2 + TSB.tileS,
        w: TSB.tileS * 3
    };
    ctx.strokeRect(rect.x, rect.y - rect.w, rect.w, rect.w);
    for(let i=0; i < 6; i++) {
        for(let j=0; j < 6; j++) {
            let pos = {x: rect.x + j * TSB.tileS/2, y: rect.y + i * TSB.tileS/2 - rect.w};
            TetriMinos.draw(pos, TSB.graphic.fill, "fill", ctx, TSB.tileS/2);
        }
    }
    
    if(TSB.nextPiece.length !== 0) {
        let nextPiece = TSB.nextPiece[0];
        for(let i=0; i < nextPiece._tetriminos.length; i++) {
            for(let j=0; j < nextPiece._tetriminos[i].length; j++) {
                let id = TileMap.getId(nextPiece._tetriminos, [j,i]);
                if(id === 1) {
                    let pos = {
                        x: ~~(rect.x + j * TSB.tileS/2) + rect.w/2 - TSB.tileS/2, 
                        y: ~~(rect.y + i * TSB.tileS/2 - rect.w) + rect.w/2 - TSB.tileS/2
                    };
                    TetriMinos.draw(pos, nextPiece._color, "fill", ctx, TSB.tileS/2);
                    TetriMinos.draw(pos, TSB.graphic.stroke, "stroke", ctx, TSB.tileS/2);
                }
            }
        }
    }
    
    game.level = ~~(game.cleared / 10);
    
    text("Next Piece", {x:rect.x + rect.w/2, y:rect.y + 30}, 'bold 15px Verdana', "dimgray");
    text(`Score: `+game.score, {x:rect.x + rect.w/2, y:30}, 'bold 15px Verdana', 'dimgray');
    text(`Cleared: `+game.cleared, {x:rect.x + rect.w/2, y:60}, 'bold 15px Verdana', 'dimgray');
    text(`Level: `+game.level, {x:rect.x + rect.w/2, y:90}, 'bold 20px Verdana', 'dimgray');
    
};

const text = (txt, p, font, color, _ctx=ctx) => {
    _ctx.fillStyle = color;
    _ctx.font = font;
    _ctx.textAlign = "center";
    _ctx.textBaseline = "middle";
    _ctx.fillText(txt, p.x, p.y);
};

function swipeControl() {
    if(game.isPlaying) {
        let _selected = TSB.active[0];
        let dir = this.data.direction;
        if(dir === 'up') {
            _selected.rotate();
        } else TetriminosMove(dir, _selected);
    }
};



addEventListener("load", () => {
    


    
    // addEventListener("keydown", e => {
    //     if(game.isPlaying) {
    //         let _selected = TSB.active[0];
    //         if(e.keyCode === 37)
    //             TetriminosMove("left", _selected);
    //         else if (e.keyCode === 39)
    //             TetriminosMove("right", _selected);
    //         else if(e.keyCode === 38)
    //             _selected.rotate(true);
    //         else if(e.keyCode === 40)
    //             TetriminosMove("down", _selected);
    //         else if(e.keyCode === 65)
    //             _selected.rotate(false);
    //         else if(e.keyCode === 68)
    //             _selected.rotate(true);
    //     }
    // });
    
    // Utils.$("#play").addEventListener("click", () => {
    //        // audio.play();
    //         game.start();
            
    //   });

    https://tetris.com/assets/images/favicon/apple-icon-180x180.png

    console.log("new");

});