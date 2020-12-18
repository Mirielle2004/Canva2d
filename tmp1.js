<!--
	NAME : DO NOT FALL 
	DATE : December 19, 2020
	AUTHOR : Lolo
-->
<!DOCTYPE html>
<html>
	<head>
		<title>DO NOT FALL</title>
		<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap" rel="stylesheet">
	</head>
	<body>
		<canvas id="canvas"></canvas>
		<div id="contout">
			<div id="out">
				<p id="text">DO NOT FALL !<p>
				<button id="btn">PLAY</button>
			</div>
		</div>		
		<div id="infolevel"></div>
	</body>
</html>




body {
	position: absolute;
	width: 100%;
	height:100%;
	margin:0;
	user-select: none;
	font-family: 'Roboto Condensed', sans-serif;
	overflow:hidden;
}
canvas{
	position:fixed;
	z-index:1;
}
#contout{
	position:fixed;
	top:30px;
	width:100%;
	height:100%;
	z-index:2;
	display: flex;
	justify-content: center;
	align-items: center;
	color:white;
	-webkit-backdrop-filter: blur(10px);
	backdrop-filter: blur(10px);
}
#out{
	width:300px;
	height:150px;
	text-align: center;
}
#text{
	font-size: 2em;
}
#btn{
	border-radius:15px;
	padding:8px;
	padding-left:15px;
	padding-right:15px;
	box-shadow: inset -2px -2px 4px black, inset 0.5px 0.5px 2px white;
	background-color: rgba(255,255,255,.1);
	color:white;
	border:none;
}
#infolevel{
	position: absolute;
	width: 100%;
	height:100%;
	text-align:center;
	-webkit-backdrop-filter: blur(10px);
	backdrop-filter: blur(10px);
	z-index:3;
	color:white;
	font-size:3em;
	display: none;
	justify-content: center;
	align-items: center;
}


let c, ctx, W, H;
let camera;
let cubes = [];
let run = false;
let player, fall = false;
let level = 1
let speed = 0.2
let stars = []

const random = (max=1, min=0) => Math.random() * (max - min) + min;

const radColor = (x0, y0, r0, x1, y1, r1) => {
	let NG = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
		NG.addColorStop(0, 'red');
		NG.addColorStop(0.9, 'black');
		NG.addColorStop(1, 'white');
	return NG;
};

const clear = () => {
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.fillRect(0, 0, W, H);
};

const eventUser = () => { 
	c.addEventListener("mousemove", function(e){
		if(!fall)player.x =  e.clientX;
	});
	c.addEventListener("touchmove", function(e){
		let touch = e.changedTouches[0];
		let touchX = parseInt(touch.clientX);
		if(!fall)player.x = touchX;
	});
};

const createStars = () => {
	stars = []
	for(let n=0; n<500; n++){
		stars.push(new Star(random(W), random(H/2+random(H/4))))
	}
}

const createCubes = ()=> {
	let r = 0, g = 200, b = 200
	let a = random(Math.PI*2)	
	let y = 0
	for(y=0; y<200; y+=10){
		for(x=-1000 ; x<2000; x+=220){
			cubes.push(new Cube(x, 0, y/4, r, g, b));
		}
	}
	for(y=200; y<1300; y+=10){
		let cal = 500*Math.cos(a)+500*Math.sin(a)
		for(let x=0 + cal; x<1000+cal; x+=220){
			cubes.push(new Cube(x, 0, y/4, r, g, b));
		}
		a+=0.5
	}
	for(y=1300; y<1320; y+=20){
		let cal = 500*Math.cos(a-0.5)+500*Math.sin(a-0.5)
		for(let x=0 + cal; x<1000+cal; x+=220){
			cubes.push(new Cube(x, 0, y/4, 255,0,0));
		}
	}
};

const drawLevel  = () => {
	ctx.beginPath()	
	ctx.fillStyle = 'white'	
	ctx.font = "15px Arial"
	ctx.fillText("Level "+level, 10, 20)
}

const nextLevel = () => {
	run = false	
	cubes = []
	createCubes()
	level++
	infolevel.style.display = 'flex'
	infolevel.innerHTML = `<p>LEVEL ${level}<p>`
	player = new Player(W/2, H-100, 20)
	speed += 0.1
	setTimeout(()=>{
		run = true			
		infolevel.style.display = 'none'
	}, 1000)
}

const gameOver = () => {
	player.y+=5
	if(run){
		run = false		
		setTimeout(()=>contout.style.display = 'flex', 1000)
	}		
}

const update = ()=> {
	stars.forEach(x => x.update());
	let cpt = 0
	if(fall)player.draw()
	for(let i=cubes.length-1; i>=0; i--){
		cubes[i].update();
		let dX = cubes[i].bx+W/2 - player.x-15 
		let dY = cubes[i].by+H/2 - player.y
		if(Math.hypot(dY, dX)<25&&!fall) {
			cubes[i].col = true
			cpt++
			if(cubes[i].r==255)nextLevel()
		}else cubes[i].col = false	
		if(cubes[i].z<-4)cubes.splice(i, 1)		
	}
	if(cpt===0)fall = true
	fall ? gameOver() :  player.draw()
	drawLevel();
}; 

class Dot{
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}	
}

class Star extends Dot{
	constructor(x, y) {
		super(x,y)
		this.rad = random(0.8,0.1)
		this.a = random(6.28)
		this.alfa = 0.5
	}	
	draw() {
		ctx.beginPath()
		ctx.globalAlpha = this.alfa
		ctx.fillStyle = 'white'
		ctx.arc(this.x, this.y, this.rad, 0, 2 * Math.PI)
		ctx.fill()
		ctx.closePath()
	}
	update() {
		this.alfa = 1 - 0.5*Math.cos(this.a)
		this.a +=0.01
		this.draw()
	}		
}

class Player extends Dot{
	constructor(x, y, s) {
		super(x,y)
		this.size = s;
	}
	draw() {
		ctx.beginPath()
		ctx.globalAlpha = 1
		ctx.fillStyle = radColor(this.x+2, this.y-7, 0, this.x, this.y, 25)
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
		ctx.fill()
		ctx.closePath()
	}	
}

class Cube extends Dot{
	constructor(x,y,z,r,g,b) {
		super(x,y,z)
		this.r = r
		this.g = g
		this.b = b
		this.size = 2
		this.col= false
		
	}
	projection(x, y, z, w, h, p) {
		this.dx = x - camera.x + w
		this.dy = y- camera.y + h/20
		this.dz = z - camera.z - p
		this.bx = -5*(this.dx/this.dz)
		this.by = -5*(this.dy/this.dz)
		return [this.bx+W/2, this.by+H/2];
	}

	draw() {
		ctx.beginPath()   
		ctx.globalAlpha = 1 
		ctx.strokeStyle = this.colorStroke
		ctx.fillStyle = this.color
		ctx.lineWidth = 0.2*(100/this.dz)
		ctx.moveTo(...this.projection(this.x, this.y, this.z, 0, 0, 0))
		ctx.lineTo(...this.projection(this.x, this.y, this.z, 200, 0, 0))
		ctx.lineTo(...this.projection(this.x, this.y, this.z, 200, 0, 2))
		ctx.lineTo(...this.projection(this.x, this.y, this.z, 0, 0, 2))
		ctx.lineTo(...this.projection(this.x, this.y, this.z, 0, 0, 0))
		ctx.stroke()
		ctx.fill()
		ctx.closePath()
	}
	update(){
		this.colorStroke = 'rgba('+this.r+','+this.g+','+this.b+','+50/this.dz+ ')'
		this.colorFill = 'rgba('+this.r+','+this.g+','+this.b+','+5/this.dz + ')'	
		this.color = this.col ? 'rgba(0,0,0,1)' : this.colorFill
		if(!fall&&run)this.z-=speed
		this.draw();
	}
}
const start = () => {
	level = 1
	contout.style.display = "none"
	text.innerText = "GAME OVER"
	btn.innerText = "TRY AGAIN"
	infolevel.style.display = "flex"
	infolevel.innerHTML = `<p>LEVEL ${level}<p>`
	setTimeout(()=>{
		infolevel.style.display = "none"
		run = true
		if(fall){
			cubes = []
			player = new Player(W/2, H-100, 20)				
			createCubes()
			fall = false
			speed = 0.2
		}			
	}, 1500)
}

const init = () => {
	c = document.getElementById("canvas");
	c.width = W = innerWidth;
	c.height = H = innerHeight
	ctx = c.getContext("2d")
	camera = {x:W*1.5, y:H*2, z:-10};
	player = new Player(W/2, H-100, 20)
	createStars();
	createCubes();
	eventUser();
	btn.addEventListener("click", ()=>start())
	animate()
};

const animate = () => {
	clear()
	update()
	requestAnimationFrame(animate);
};

window.onload = init;






