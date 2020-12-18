let g, ctx, scene, ball, walls, levelInfo, currentLevel;
let jsVel, jsRot;

const {min, max, sin, cos, ceil} = Math;

// physics parameters decorator's info for the ball
let ballPhysicsDecorator = {
    velocity: {x:null, y:null}, 
    acceleration: {x:0, y:null},
    rotation:0,
    mass: 5,
    speed: 0,
};

// setup the game
const setup = {
    isPlaying: false, 

    start() {
        this.influencer = [];       // array of speed influencers
        this.walls = [];            // array container walls rasteriser
        this.points = [];           // array of destination point
        this.capsules = [];         // array of wall's components position
        this.trial = 3 + currentLevel*2;   // trial count
        this.slowElapsed = 0;       // waiting counter if ball stop by speed reducer
        this.isPlaying = true;
        let cLevel = levelInfo.find(i => i.id === currentLevel);
        // position the player
        ball.velocity = new g.Vector2();
        ball.pos = g.Vector2.createFrom(cLevel.pos);
        // draw walls
        cLevel.walls.forEach(data => {
            new Capsule([data.x, data.y], Math.degToRad(data.a), 
                data.c, data.r, data.l);
        });
        // draw speed iinfluencers
        cLevel.influencer.forEach(data => {
            for(const [type, pos] of Object.entries(data)) {
                pos.forEach(p => {
                    let influencer = new Speedinfluencer(type, p);
                    this.influencer.push(influencer);
                });
            }
        });
        // draw destination points
        cLevel.points.forEach(p => {
            let size = Math.random() * ball.r/2 + ball.r/2;
            let circle = new g.Component.Shape("circle", p, size);
            this.points.push(circle);
        });
        // show level
        g.Utils.$("#level").innerHTML = `Level: ${currentLevel}`;
    },
    // this function is called when game over
    over() {
        this.isPlaying = false;
        ball.speed = 0;
        ball.velocity = new g.Vector2();
        g.Utils.$("#startScreen").css({display:"block"});
        g.Utils.$("#startScreen").css({display:"flex"});
        g.Utils.$("#txt").innerHTML = "GameOver";
        g.Utils.$("#txt").css({color:"red"});
    },
    // handy function to draw fill and/or filled-stroke circle
    drawArc(p, r, color, stroke=false, strokeColor) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        if(stroke) {
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
    }
};

/**
 * @function Capsule
 * @description creates a capsule like graphics representing
 * the wall. The capsule is composed of various circles binded 
 * together in a rectangle, collision between the capsule and the 
 * player(ball) is that of an elastic in respect to the ball.
 * 
 * creating a capsule involves creating a n* circles across a n-angle
 * but just the first and the last circles are drawn. other circles 
 * between are represented as a line orthogonal and scaled by the
 * half of their radius
 * 
 * @param {Vector2} pos starting position of the wall
 * @param {Number} angle angle formed by the wall
 * @param {String} color color of the wall
 * @param {Number} radius radius of each circles in the wall
 * @param {Number} length length of the wall
 * @returns {Capsule} a capsule representing the walls
 */
const Capsule = (function(pos, angle, color, radius=50, length=5) {
    
    let startPos = new g.Vector2(...pos);
    let circles = [];
    let spacing = 0;

    for(let i=0; i < length; i++) {
        let rot = new g.Vector2(Math.cos(angle), Math.sin(
            angle)).scale(spacing);
        let pos = startPos.add(rot);
        let circle = new g.Component.Shape("circle", pos, radius/2);
        circles.push(circle);
        setup.capsules.push(circle);
        spacing += radius;
    };

    let diffPos = circles[length-1].pos.sub(startPos);
    let [normalUp, normalDown] = [[], []];

    circles.forEach(circle => {
        // we get two normal vector to each circles position
        let cross = diffPos.cross();
        let angU = new g.Vector2(diffPos.y, -diffPos.x);
        let angD =new g.Vector2(-diffPos.y, diffPos.x);
        let normal1 = circle.pos.add(angU.normalise().scale(radius/2));
        let normal2 = circle.pos.add(angD.normalise().scale(radius/2));
        normalUp.push(normal1);
        normalDown.push(normal2);
    });
    // need to be reversed else the line will be drawn as a X-shape instead of a rect
    let shouldReverse = g.Utils.randFromArray([true, false]);
    normalDown = shouldReverse ? normalDown.reverse() : normalDown;

    const createGradient = () => {
        let middle = ceil(circles.length/2);
        let circle = circles[middle - 1].pos;
        let grd = ctx.createRadialGradient(circle.x, circle.y, 
            0, circle.x, circle.y, radius * length);
        grd.addColorStop(0, "lightgray");
        grd.addColorStop(1, color);
        return grd;
    };

    class Capsule {
        constructor() {
            setup.walls.push(this);
        }
    
        draw() {
            let grd1 = createGradient(circles[0].pos);
            let grd2 = createGradient(circles[length-1].pos);
            // let grd1 = "red";
            ctx.save();
            setup.drawArc(circles[0].pos, circles[0].r, grd1, true, color);
            setup.drawArc(circles[length-1].pos, circles[length-1].r, grd2, true, color);
            ctx.beginPath();
            ctx.moveTo(normalUp[0].x, normalUp[0].y);
            for(let i=1; i < normalUp.length; i++)
                ctx.lineTo(normalUp[i].x, normalUp[i].y);
            normalDown.forEach(i => ctx.lineTo(i.x, i.y));
            ctx.fillStyle = createGradient(circles[3].pos);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }
    }

    return new Capsule();
});


/**
 * @function bounceWall
 * @description describe ball behavior when it collides with a wall
 * @param {Capsule} wall representing the wall
 */
function bounceWall (wall) {

    let velDiff = this.velocity.sub(wall.velocity);
    let vecDiff = wall.pos.sub(this.pos);

    if(vecDiff.dot(velDiff) >= 0) {
        let angle = -Math.atan2(vecDiff.y, vecDiff.x);

        const m1 = this.mass;  
        const m2 = wall.mass;

        let rotMat = g.Mat3x3.makeRotate(angle);
        let rotMatu1 = rotMat.multiplyVec(this.velocity.toArray());
        let rotMatu2 = rotMat.multiplyVec(wall.velocity.toArray());
        const u1 = new g.Vector2(...rotMatu1);
        const u2 = new g.Vector2(...rotMatu2);

        const v1 = { x:(((m1 - m2) * u1.x) / (m1 + m2)) + ((2 * m2) * u2.x) / (m1 + m2),
            y: u1.y};
        const v2 = {x:(((2 * m1)*u1.x) / (m1 + m2)) + (((m2 - m1) * u2.x) / (m1 + m2)), 
            y: u2.y};
        
        rotMat = g.Mat3x3.makeRotate(-angle);
        let rotMatv1 = rotMat.multiplyVec([v1.x, v1.y, 1]);
        let rotMatv2 = rotMat.multiplyVec([v2.x, v2.y, 1]);

        this.velocity = g.Vector2.createFrom(rotMatv1);
        wall.velocity = new g.Vector2();
        this.rotation = this.velocity.angle;
    }
}

// game Loop
function gameLoop() {

    ctx = this.getContext("2d");
    let dt = this.getFelapsedTimePS();
    ctx.clearRect(0, 0, this.getWidth(), this.getHeight());

    setup.influencer.forEach(i => i.update());

    setup.capsules.forEach(circle => {
        let dist = ball.pos.sub(circle.pos);
        if(dist.length <= ball.r + circle.r) {
            circle.mass = 50;
            circle.velocity = new g.Vector2(0,0);
            ball.bounceWall(circle);
        }
    });

    setup.walls.forEach(wall => wall.draw());

    setup.points.forEach((p, i) => {
        let dist = ball.pos.sub(p.pos).length;
        if(dist <= p.r + ball.r) {
            setup.points.splice(i, 1);
        }
        setup.drawArc(p.pos, p.r, "#fff", true, "yellow");
    });

    if(setup.points.length === 0) {
        currentLevel++;
        ball.speed = 0;
        ball.velocity = new g.Vector2();
        setup.start();
    };

    if(ball.pos.x <= ball.r || ball.pos.x - ball.r >= innerWidth ||
        ball.pos.y <= ball.r || ball.pos.y - ball.r >= innerHeight) {
            setup.trial--;
            ball.speed = 0;
            let pos = levelInfo.find(i => i.id === currentLevel).pos;
            ball.pos = g.Vector2.createFrom(pos);
            ball.velocity = new g.Vector2();
    }

    if(setup.trial < 0) setup.over();

    // draw the ball
    ball.acceleration = new g.Vector2(0, 10);
    if(ball.velocity.y !== 0) {
        ball.velocity = ball.velocity.add(ball.acceleration);
    }
    ball.pos = ball.pos.addScale(ball.velocity, dt);

    let ballGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ball.r);
    ballGradient.addColorStop(0, "lightgray");
    ballGradient.addColorStop(1, "red");
    ctx.save();
    ctx.translate(ball.pos.x, ball.pos.y);
    ctx.rotate(ball.rotation);
    setup.drawArc({x:0, y:0}, ball.r, ballGradient);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ball.r, 0);
    ctx.closePath();
    ctx.strokeStyle = "yellow";
    ctx.stroke();
    ctx.restore();

    g.Utils.$("#trial").innerHTML = `Try: ${setup.trial}`;
};



class Speedinfluencer {
    constructor(type, pos) {
        // sb - speedBooster
        // sr - speedReducer
        this.type =  type;
        this.pos = g.Vector2.createFrom(pos);
        this.r = ball.r;
    }

    draw() {
        if(this.type === "sb") {
            setup.drawArc(this.pos, ball.r, "teal");
            ctx.beginPath();
            ctx.moveTo(this.pos.x + ball.r/2, this.pos.y - ball.r);
            ctx.lineTo(this.pos.x - ball.r/2, this.pos.y - ball.r/2);
            ctx.lineTo(this.pos.x, this.pos.y);
            ctx.lineTo(this.pos.x - ball.r/2, this.pos.y + ball.r);
            ctx.lineTo(this.pos.x + ball.r/2, this.pos.y);
            ctx.lineTo(this.pos.x, this.pos.y - ball.r/2);
            ctx.closePath();
            ctx.fillStyle = "#222";
            ctx.fill();
        } else if(this.type === "sr") {
            setup.drawArc(this.pos, ball.r, "yellow");
            setup.drawArc(this.pos.sub([ball.r/4, 0]), ball.r/1.5, "#222");
            setup.drawArc(this.pos.add([ball.r/2, 0]), ball.r/3, "#222");
        }
    }

    update() {
        if(g.Collision.circle(this, ball)) {
            if(this.type === "sr") {
                setup.slowElapsed++;
                ball.velocity = ball.velocity.mult([.97, .97]);
                if(setup.slowElapsed >= 200) {
                    setup.trial--;
                    ball.speed = 0;
                    ball.velocity = new g.Vector2();
                    let pos = levelInfo.find(i => i.id === currentLevel).pos;
                    ball.pos = g.Vector2.createFrom(pos);
                    setup.slowElapsed = 0;
                }
            }
            else if(this.type === "sb") 
                ball.velocity = ball.velocity.scale(1.2);
        }
        this.draw();
    }
};


addEventListener("keydown", e => {
    if(setup.isPlaying) {
        let rotSpeed = .1;
        if(e.keyCode === 37) {
            ball.rotation -= rotSpeed;
        } else if(e.keyCode === 39) {
            ball.rotation += rotSpeed;
        } else if(e.keyCode === 32) {
            if(ball.velocity.x === 0 && ball.velocity.y === 0) {
                ball.speed += 20;
            }
        }
    }
});

addEventListener("keyup", e => {
    if(setup.isPlaying) {
        if(e.keyCode === 32) {
            if(ball.velocity.x === 0 && ball.velocity.y === 0) {
                let angle = ball.rotation;
                let speed = Math.min(800, ball.speed);
                ball.velocity.x = Math.cos(angle) * speed;
                ball.velocity.y = Math.sin(angle) * speed;
            }
        };
    }
});



/**
 * @function createLevel 
 * @description creates the data for each levels
 * @param {Number} w client's width size in pixel
 * @param {Number} h client's height size in pixel
 * @param {Canva2D.API.Component.Shape} ball a circular shaped object
 * @returns {Object} all levels data
 */
const createLevel = (function(w, h, ball) {
    return [
        {
            id: 1, 
            points: [[w/2, 100]], 
            walls: [{x:w/2 + w/3, y:h - ball.r - 30, a:-80, c:"teal", r:20, l:70}, 
            {x:w - w/3, y:h/2, a:190, c:"red", r:20, l:7}, 
            {x:w/3, y:h - ball.r - 30, a:-100, c:"teal", r:20, l:30}],
            pos: [w/2 - ball.r/2, h - ball.r -10],
            influencer: [{sb:[[w/2 + w/3, h/2 - 100]]}, {sr:[[w/2, 200]]}]
        }, {
            id: 2, 
            points: [[w/2 - ball.r, h/2 + 200 - ball.r * 2], 
            [w/2 - w/6 - ball.r, 200 - ball.r * 2]], 
            walls: [{x:w/2 + w/3, y:h - ball.r - 30, a:-80, c:"teal", r:20, l:70}, 
            {x:w - w/3, y:h/2, a:90, c:"red", r:20, l:7},
            {x:w - w/3, y:h/2 + 200, a:190, c:"green", r:20, l:7},
            {x:w , y:100, a:-180, c:"yellow", r:50, l:7},
            {x:w/3, y:h - ball.r - 30, a:-100, c:"teal", r:20, l:30}],
            pos: [w/2 + ball.r, h - ball.r -10],
            influencer: [{sb:[[w/2 + w/3, h/2-10]]}, {sr:[[w/2 + w/3, h/2 - 100], 
                [w/2, h/2]]}]
        }, {
            id: 3, 
            points: [[w/2 - ball.r, h/2 + 200 - ball.r * 2], 
            [w/2 - w/6 - ball.r, 200 - ball.r * 2]], 
            walls: [{x:w/2 + w/3, y:h - ball.r - 30, a:-80, c:"teal", r:20, l:70}, 
            {x:w - w/3, y:h/2, a:90, c:"red", r:20, l:7},
            {x:w - w/3, y:h/2 + 200, a:190, c:"green", r:20, l:7},
            {x:w , y:100, a:-180, c:"purple", r:50, l:7},
            {x:w/3, y:h - ball.r - 30, a:-100, c:"teal", r:20, l:30}],
            pos: [w/2 + ball.r, h - ball.r -10],
            influencer: [{sb:[[w/2 + w/3, h/2-10], [w/2 - w/5, h/2]]}, 
            {sr:[[w/2 + w/3, h/2 - 100], [w/2, h/2], [w/2, 200 - ball.r * 2]]}]
        }, {
            id: 4, 
            points: [[w/2 - ball.r, h/2 + 200 - ball.r * 2], 
            [w/2 + w/3, h/2 + h/7]], 
            walls: [{x:w/2 + w/3, y:h - ball.r - 30, a:-80, c:"teal", r:20, l:70}, 
            {x:w - w/3, y:h/2, a:90, c:"red", r:20, l:7},
            {x:w - w/3, y:h/2 + 200, a:-15, c:"green", r:20, l:7},
            {x:w , y:100, a:-180, c:"yellow", r:50, l:7},
            {x:w/3, y:h - ball.r - 30, a:-100, c:"teal", r:20, l:30}],
            pos: [w/2 + ball.r, h - ball.r -10],
            influencer: [{sb:[[w/2 + w/3, h/2-10], ]}, 
            {sr:[[w/2 + w/3, h/2 - 100], [w/2, h/2]]}]
        }, {
            id: 5, 
            points: [[w/2 + ball.r + 10, h/2 + ball.r/2  +10], 
            [w/2 + w/3, h/2 + h/7]], 
            walls: [{x:w/2 + w/3, y:h - ball.r - 30, a:-80, c:"teal", r:20, l:70}, 
            {x:w/2, y:h/2, a:90, c:"red", r:20, l:7},
            {x:-ball.r*2, y:h/2 + 200, a:55, c:"green", r:20, l:7},
            {x:w , y:100, a:-180, c:"yellow", r:50, l:7},
            {x:w/3, y:h - ball.r - 50, a:-60, c:"pink", r:20, l:30}],
            pos: [w/2 + ball.r, h - ball.r -10],
            influencer: [{sb:[[100, 200], ]}, 
            {sr:[[w/2 + w/3, h/2 - 100], [100, 300]]}]
        }];
});


const main = () => {

    g = Canva2D.getAPI();
    scene = new g.Scene(innerWidth, innerHeight, true);
    scene.css({backgroundColor:"#000"});
    ctx = scene.getContext("2d");

    jsVel = g.JoyStick("default", {
        dynamic: true,
        outerRadius: 50,
        pos: {x:50 - 10, y:50 - 10}
        
    });

    jsVel.onStart = function() {
        if(!setup.isPlaying) {
            this.isActive = false;
            this.hide();
        } else {
            this.show();
        }
    }

    jsVel.onDrag = function() {
        this.show();
        if(setup.isPlaying) {
            ball.rotation = this.data.angle;
            if(ball.velocity.x === 0 && ball.velocity.y === 0) {
                ball.speed += 20;
            }
        }
    }

    jsVel.onEnd = function() {
        if(ball.velocity.x === 0 && ball.velocity.y === 0) {
            let angle = ball.rotation;
            let speed = Math.min(800, ball.speed);
            ball.velocity.x = Math.cos(angle) * speed;
            ball.velocity.y = Math.sin(angle) * speed;
        }
    }

    currentLevel = 1;   
    ball = new g.Component.Shape("circle", [0, 0], 20);
    ball.bounceWall = bounceWall;
    levelInfo = createLevel(innerWidth, innerHeight, ball);
    setup.start();
    setup.isPlaying = false;

    g.PhysicsDecorator(ball, ballPhysicsDecorator);
    ball.velocity = new g.Vector2();

    g.Utils.$("#restart").addEventListener("click", ()=>{
        setup.start()
    });
    g.Utils.$("#play").addEventListener("click", () => {
        g.Utils.$("#startScreen").css({display:"none"});
        setup.start();
    });
    g.Utils.$("#about").addEventListener("click", () => {
        alert(`INSTRUCTION
You are expected to move the red ball from it's origin point to their destination point(Every white circle on the screen).

The speed and velocity of the ball is affected by the walls, speed booster(teal colored circle with flash icon),
speed reducer(yellow colored circle with snail icon) and the invisible gravity.

You are the the N-trial chance to execute your task else game over.
Trial count reduces if you move the ball offscreen, velocity remanded zero due to the speedReducer.

Game Over when you have -1 trial left`);
    });

    scene.update = gameLoop;
    scene.start();

    
};

addEventListener("load", () => {
    
});