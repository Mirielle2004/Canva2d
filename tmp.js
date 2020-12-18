let canvas, gl, W, H;
let startAnime = true;

let vShader = `
attribute vec4 a_position;
attribute vec4 color;
varying highp vec4 vColor;
uniform mat4 viewMat;
uniform mat4 rotMat;
uniform mat4 projMat;
void main() {
    gl_Position = viewMat * projMat* (rotMat * a_position);
    gl_PointSize = 10.0;
    vColor = color;
}`;

let fShader = `
varying highp vec4 vColor;
void main() {
    gl_FragColor = vColor;
}`;

const initShader = (vs, fs) => {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vs);
    gl.shaderSource(fragmentShader, fs);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.program = program;
};

const createVertexBuffer = (data) => {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
};

let camera = new Vector3(), lookDir, yaw=0;
let aa=0;

const update = () => {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let up = new Vector3(0, 1, 0);
    let target = new Vector3(0, 0, 1);
    lookDir = Mat4x4.makeRotateY(yaw).multiplyVec(target.toArray());
    target = camera.add(lookDir);
    let lookAt = Mat4x4.setView(camera, target, up);

    let rotMatr = Mat4x4.makeRotateZ(aa);

    let projMatrice = new Matrix4();
    projMatrice.setPerspective(30, W/H, 1, 1000);

    // aa+=.01;
    initShader(vShader, fShader);
    let projMat = gl.getUniformLocation(gl.program, "projMat");
    gl.uniformMatrix4fv(projMat, false, projMatrice.elements);
    let viewMat = gl.getUniformLocation(gl.program, "viewMat");
    gl.uniformMatrix4fv(viewMat, false, lookAt.items);
    let rotMat = gl.getUniformLocation(gl.program, "rotMat");
    gl.uniformMatrix4fv(rotMat, false, rotMatr.items);
    let points = new Float32Array([
        0.75, 1.0, -4.0, 1.0, 0.0, 0.0, 1.0,
        0.25, -1.0, -4.0, 1.0, 0.0, 0.0, 1.0,
        1.25, -1.0, -4.0, 1.0, 0.0, 0.0, 1.0,

        0.75, 1.0, -2.0, 1.0, 1.0, 1.0, 1.0,
        0.25, -1.0, -2.0, 1.0, 1.0, 1.0, 1.0,
        1.25, -1.0, -2.0, 1.0, 1.0, 1.0, 1.0,
    ]);
    let vSize = points.BYTES_PER_ELEMENT;
    let pointBuffer = createVertexBuffer(points);
    let a_position = gl.getAttribLocation(gl.program, "a_position");
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, vSize * 7, 0);
    gl.enableVertexAttribArray(a_position);
    let color = gl.getAttribLocation(gl.program, "color");
    gl.vertexAttribPointer(color, 4, gl.FLOAT, false, vSize * 7, vSize * 3);
    gl.enableVertexAttribArray(color);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

const animate = () => {
    update();
    requestAnimationFrame(animate);
};

addEventListener("keydown", e => {
    if(e.keyCode === 37) camera.x-=.1;
    else if(e.keyCode === 39) camera.x += .1;
    else if(e.keyCode === 38) camera.z -= .1;
    else if(e.keyCode === 40) camera.z += .1;
    else if(e.keyCode === 65) yaw += .1;
});

const main = () => {
    canvas = document.getElementById("cvs");
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    gl = canvas.getContext("experimental-webgl");
    startAnime ? requestAnimationFrame(animate) : update();
};

addEventListener("load", main);