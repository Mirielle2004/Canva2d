/**
 * @todo
 * -- Add {Multitouch support, direction, fullArea, boundingRect}
 * @param {String} type 
 * @param {Object} config 
 */
Canva2D.API.JoyStick = (function(type="default", config={}) {

    let Vector2 = Canva2D.API.Vector2;
    let display = false;
    let isFading = false;
    let timeOutCounter = 0;

    let _config = {
        dynamic: true,
        pos: new Vector2(),
        innerRadius: 15,
        color: "lightgray",
        outlineColor: "#222",
        lineWidth: 4,
        outerRadius: 50,
        backgroundColor: "none",
        backgroundOutlineColor: "#222",
        backgroundLineWidth:4, 
        timeOut: 100,
        showLine: false,
        zIndex: 1,
    };
    var canvas = document.createElement("canvas");
    setConfig(config);
    canvas.width = _config.outerRadius * 2;
    canvas.height = _config.outerRadius * 2;
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);

    let ctx = canvas.getContext("2d");
    let alpha = 1;
    let origin = new Vector2(canvas.width, canvas.height).scale(0.5);
    let throwtle = new Vector2(canvas.width, canvas.height).scale(0.5);
    let isActive = false;

    const update = () => {
        ctx.save();
        
        if(_config.dynamic) {
            if(display) {
                if(isFading) {
                    timeOutCounter--;
                    let alpha = Math.abs(timeOutCounter / _config.timeOut);
                    ctx.globalAlpha = alpha;
                    if(alpha <= 0) {
                        display = false;
                        isFading = false;
                        timeOutCounter = _config.timeOut;
                    }
                }
                _draw(origin.x, origin.y, _config.outerRadius, _config.backgroundColor, 
                    _config.backgroundOutlineColor, _config.backgroundLineWidth);
                _draw(throwtle.x, throwtle.y, _config.innerRadius, 
                    _config.color, _config.outlineColor, _config.lineWidth);
            }
        } else {
            ctx.globalAlpha = 1;
            _draw(origin.x, origin.y, _config.outerRadius, _config.backgroundColor, 
                _config.backgroundOutlineColor, _config.backgroundLineWidth);
            _draw(throwtle.x, throwtle.y, _config.innerRadius, 
                _config.color, _config.outlineColor, _config.lineWidth);
        }
        ctx.restore();
    };

    const animate = () => {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        update();
        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    // set joystick config
    function setConfig(config) {
        for(const key in config) {
            if(_config[key] !== undefined) 
                _config[key] = config[key];
        }
        if(!_config.dynamic) {
            canvas.style.left = `${_config.pos.x}px`;
            canvas.style.top = `${_config.pos.y}px`;
        }
        timeOutCounter = _config.timeOut;
        canvas.style.zIndex = `${_config.zIndex}`;
    }

    // draw Joystick
    function _draw(x, y, radius, fill, stroke, width=0) {
        ctx.save();
        ctx.lineWidth = width;
        ctx.strokeStyle = stroke || fill;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.closePath();
        if(!(stroke === "none" || stroke === "")) ctx.stroke();
        if(!(fill === undefined || fill === "none" || fill === "")) ctx.fill();
        ctx.restore();
    }

    function hide() {
        canvas.style.display = 'none';
    }

    function show() {
        canvas.style.display = 'block';
    }

    function mouse() {

        addEventListener("mousedown", e => {
            if(!_config.dynamic) {
                let cPos = new Vector2(e.clientX, e.clientY);
                let destPos = new Vector2(_config.pos.x, _config.pos.y)
                    .add([_config.outerRadius/2, _config.outerRadius/2]);
                let dist = destPos.sub(cPos);
                if(dist.length <= _config.innerRadius * 3) {
                    API.isActive = true;
                    API.data = e;
                    if(typeof API.onStart === "function")
                        API.onStart();
                }
            } else {
                canvas.style.left = `${e.clientX - _config.outerRadius}px`;
                canvas.style.top = `${e.clientY - _config.outerRadius}px`;
                API.isActive = true;
                display = true;
                isFading = false;
                timeOutCounter = _config.timeOut;
                if(typeof API.onStart === "function")
                    API.onStart();
            }
        });


        addEventListener("mousemove", e => {
            let cssPos = canvas.getBoundingClientRect();
            let nPos = Vector2.createFrom({
                x: e.clientX - cssPos.left + _config.innerRadius,
                y: e.clientY - cssPos.top + _config.innerRadius
            });
            let origin = Vector2.createFrom(_config.pos).add(
                [_config.outerRadius/2, _config.outerRadius/2]);
            if(API.isActive) {
                let diffPos = nPos.sub(origin);
                let radius = Math.min(diffPos.length, _config.outerRadius - _config.innerRadius);
                let angle = Math.atan2(diffPos.y, diffPos.x);
                throwtle = {
                    x: origin.x - _config.innerRadius + Math.cos(angle) * radius,
                    y: origin.y - _config.innerRadius + Math.sin(angle) * radius
                };
                API.data = {
                    pointer: e,
                    angle: angle, 
                    length: radius, 
                    direction: "STATIC"
                }
                if(typeof API.onDrag === "function")
                    API.onDrag();
            }
        });

        addEventListener("mouseup", e => {
            let origin = Vector2.createFrom(
                [_config.outerRadius, _config.outerRadius])
            throwtle = origin;
            API.isActive = false;
            isFading = true;
            if(typeof API.onEnd === "function")
                API.onEnd();
        });
    };


    function touch() {

        addEventListener("touchstart", e => {
            if(!_config.dynamic) {
                let cPos = new Vector2(e.touches[0].pageX, e.touches[0].pageY);
                let destPos = new Vector2(_config.pos.x, _config.pos.y)
                    .add([_config.outerRadius/2, _config.outerRadius/2]);
                let dist = destPos.sub(cPos);
                if(dist.length <= _config.innerRadius * 3) {
                    API.isActive = true;
                    API.data = e;
                    if(typeof API.onStart === "function")
                        API.onStart();
                }
            } else {
                canvas.style.left = `${e.clientX - _config.outerRadius}px`;
                canvas.style.top = `${e.clientY - _config.outerRadius}px`;
                API.isActive = true;
                display = true;
                isFading = false;
                timeOutCounter = _config.timeOut;
                if(typeof API.onStart === "function")
                    API.onStart();
            }
        });


        addEventListener("touchmove", e => {
            let cssPos = canvas.getBoundingClientRect();
            let nPos = Vector2.createFrom({
                x: e.touches[0].pageX - cssPos.left + _config.innerRadius,
                y: e.touches[0].pageY - cssPos.top + _config.innerRadius
            });
            let origin = Vector2.createFrom(_config.pos).add(
                [_config.outerRadius/2, _config.outerRadius/2]);
            if(API.isActive) {
                let diffPos = nPos.sub(origin);
                let radius = Math.min(diffPos.length, _config.outerRadius - _config.innerRadius);
                let angle = Math.atan2(diffPos.y, diffPos.x);
                throwtle = {
                    x: origin.x - _config.innerRadius + Math.cos(angle) * radius,
                    y: origin.y - _config.innerRadius + Math.sin(angle) * radius
                };
                API.data = {
                    pointer: e,
                    angle: angle, 
                    length: radius, 
                    direction: "STATIC"
                }
                if(typeof API.onDrag === "function")
                    API.onDrag();
            }
            e.preventDefault();
        });

        addEventListener("touchend", e => {
            let origin = Vector2.createFrom(
                [_config.outerRadius, _config.outerRadius])
            throwtle = origin;
            API.isActive = false;
            isFading = true;
            if(typeof API.onEnd === "function")
                API.onEnd();
        });
    };

    if(type === "default") {
        mouse();
        touch();
    } else if(type === "mouse") {
        mouse();
    } else if(type === "touch") {
        touch();
    }

    // onStart, onDrag, onEnd
    var API = {
        isActive: false,
        setConfig: setConfig,
        hide: hide,
        show: show
    };

    return API;
    
});