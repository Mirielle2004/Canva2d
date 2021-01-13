;{

    /**
     * @todo
     * -- Add {Multitouch support, direction, fullArea, boundingRect}
     * @param {String} type 
     * @param {Object} config 
     */
    const JoyStick = (function(type="use_default", config={}) {

        const {DEFAULT, TOUCH, MOUSE, Vector2} = Canva2D.API;

        let direction, 
            display = false, 
            isFading = false, 
            timeOutCounter = 0, 
            thisTouch = null,
            tpCache = []; // touch point cache

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
            zIndex: 2000,
            offset: 10
        };

        var canvas = document.createElement("canvas");
        // canvas.style.backgroundColor = "green";
        canvas.style.position = "absolute";
        setConfig(config);
        document.body.appendChild(canvas);

        display = _config.dynamic ? false : true;

        let ctx = canvas.getContext("2d");
        let origin = new Vector2(canvas.width, canvas.height).scale(0.5);
        let throwtle = new Vector2(canvas.width, canvas.height).scale(0.5);

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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
                }
            } else  ctx.globalAlpha = 1;
            _draw(origin.x, origin.y, _config.outerRadius, _config.backgroundColor, 
                _config.backgroundOutlineColor, _config.backgroundLineWidth);
            _draw(throwtle.x, throwtle.y, _config.innerRadius, 
                _config.color, _config.outlineColor, _config.lineWidth);
            ctx.restore();

            if(!display) canvas.style.display = "none";
            else canvas.style.display = "block";
            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);

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
            canvas.width = _config.outerRadius * 2 + _config.offset;
            canvas.height = _config.outerRadius * 2 + _config.offset;
            canvas.style.zIndex = `${_config.zIndex}`;
        };

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
        };

        function hide() {
            display = false;
        };

        function show() {
            display = true;
        };

        // Normalise origin's coordinate
        const NMCOrigin = pos => ({
            x: (pos.x - _config.pos.x - canvas.width / 2) / (canvas.width/2),
            y: (pos.y - _config.pos.y - canvas.height / 2) / (canvas.height/2),
        });

        // Normalise throwtle's coordinate
        const NMCThrowtle = pos => ({
            x: (pos.x - _config.pos.x - canvas.width / 2) / (_config.innerRadius),
            y: (pos.y - _config.pos.y - canvas.height / 2) / (_config.innerRadius),
        });

        // set the direction of the joystick
        const setDirection = pos => {
            if(Math.abs(pos.x) > Math.abs(pos.y))
                direction = pos.x > 0 ? "right" : "left";
            else
                direction = pos.y > 0 ? "down" : "up"
        };

    
        function touch() {
            addEventListener("touchstart", e => {
                e.targetTouches.forEach(target => tpCache.push(target));
                tpCache.forEach(touch => {
                    let point = new Vector2(touch.pageX, touch.pageY);
                    if(!_config.dynamic) {
                        let _throwtleTouch = NMCThrowtle(point);
                        if(_throwtleTouch.x >= -1 && _throwtleTouch.x <= 1 && 
                            _throwtleTouch.y >= -1 && _throwtleTouch.y <= 1) {
                                thisTouch = touch;
                                API.isActive = true;
                                API.pointer = e;
                                if(typeof API.onStart === "function")
                                    API.onStart();
                        };
                    } else {
                        
                    }
                });
                // } else {
                    // _config.pos = {
                    //     x: e.clientX - _config.outerRadius - _config.offset/2,
                    //     y: e.clientY - _config.outerRadius - _config.offset/2
                    // };
                    // canvas.style.left = `${e.clientX - _config.outerRadius - _config.offset/2}px`;
                    // canvas.style.top = `${e.clientY - _config.outerRadius - _config.offset/2}px`;
                    // API.isActive = true;
                    // API.pointer = e;
                    // display = true;
                    // isFading = false;
                    // timeOutCounter = _config.timeOut;
                    // if(typeof API.onStart === "function")
                    //     API.onStart();
                // };
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
            }, {passive:false});

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


        /**
         * Make Mouse control the Joystick
         */
        function mouse() {
            addEventListener("mousedown", e => {
                let _mouse = new Vector2(e.clientX, e.clientY);
                if(!_config.dynamic) {
                    let _throwtleTouch = NMCThrowtle(_mouse);
                    if(_throwtleTouch.x >= -1 && _throwtleTouch.x <= 1 && 
                        _throwtleTouch.y >= -1 && _throwtleTouch.y <= 1) {
                            API.isActive = true;
                            API.pointer = e;
                            if(typeof API.onStart === "function")
                                API.onStart();
                    };
                } else {
                    _config.pos = {
                        x: e.clientX - _config.outerRadius - _config.offset/2,
                        y: e.clientY - _config.outerRadius - _config.offset/2
                    };
                    canvas.style.left = `${e.clientX - _config.outerRadius - _config.offset/2}px`;
                    canvas.style.top = `${e.clientY - _config.outerRadius - _config.offset/2}px`;
                    API.isActive = true;
                    API.pointer = e;
                    display = true;
                    isFading = false;
                    timeOutCounter = _config.timeOut;
                    if(typeof API.onStart === "function")
                        API.onStart();
                };
            });

            addEventListener("mousemove", e => {
                let _mouse = new Vector2(e.clientX, e.clientY);
                if(API.isActive) {
                    let NMC = NMCOrigin(_mouse);
                    let diffPos = new Vector2(NMCOrigin(_mouse)).scale(_config.outerRadius);
                    let radius = Math.min(_config.outerRadius - _config.innerRadius, diffPos.length);
                    let angle = Math.atan2(NMC.y, NMC.x);
                    throwtle = {
                        x: origin.x + Math.cos(angle) * radius,
                        y: origin.y + Math.sin(angle) * radius
                    };
                    setDirection(diffPos);
                    API.pointer = e;
                    API.angle = angle;
                    API.radius = radius;
                    API.direction = direction;
                    if(typeof API.onDrag === "function")
                        API.onDrag();
                }
            });

            addEventListener("mouseup", e => {
                throwtle = new Vector2(canvas.width, canvas.height).scale(0.5);
                API.isActive = false;
                isFading = true;
                if(typeof API.onEnd === "function")
                    API.onEnd();
            });
        };

        // onStart, onDrag, onEnd
        var API = {
            isActive: false,
            setConfig: setConfig,
            hide: hide,
            show: show
        };

        switch(type) {
            case TOUCH:
                touch();
                break;
            case MOUSE:
                mouse();
                break;
            case DEFAULT:
                touch();
                mouse();
                break;
            default:
                throw new Error(`Please Provide a valid controller for the joystick`);
        };

        return API;
        
    });

    Object.defineProperties(Canva2D.API, {
        JoyStick: {value: JoyStick},
    });

};