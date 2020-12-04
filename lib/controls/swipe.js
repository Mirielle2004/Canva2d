const Swipe = (function(element, type, single) {

    function getSwipeDirection(v1, v2) {
        let diffPos = {
            x: v2.x - v1.x,
            y: v2.y - v1.y
        };
        let dir = "";
        if(Math.abs(diffPos.x) > Math.abs(diffPos.y)) {
            if(diffPos.x > 0) 
                return [diffPos, "right"]
            return [diffPos, "left"]
        } else {
            if(diffPos.y > 0)
                return [diffPos, "down"]
            else return [diffPos, "up"]
        };
    };


    // function to handler swipe with touch
    function multiTouch(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("touchstart", e => {
            
        });
        
        ele.addEventListener("touchmove", e => {
            
        });
        
        ele.addEventListener("touchend", e => {
            
        });
    };

    // function that handles single touch events
    function singleTouch(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("touchstart", e => {
            el.data.origin = {x: e.touches[0].pageX, y: e.touches[0].pageY};
            el.data.isActve = true;
            if(typeof el.onSwipeStart === "function") el.onSwipeStart();
        });
        
        ele.addEventListener("touchmove", e => {
            let getDiffDir = getSwipeDirection(el.data.origin, {x: e.touches[0].pageX, y:e.touches[0].pageY});
            let newData = {
                mouse: e,
                currentPos: {x:e.touches[0].pageX, y:e.touches[0].pageY},
                diffPos: getDiffDir[0],
                direction: getDiffDir[1],
                angle: Math.atan2(getDiffDir[0].y, getDiffDir[0].x)
            };
            Object.assign(el.data, newData);
            if(typeof el.onSwipeMove === "function")
                el.onSwipeMove();
        e.preventDefault();
        }, {passive:false});
        
        ele.addEventListener("touchend", e => {
        el.data = {
            origin: {x: 0, y: 0},

            isActive: false,
            direction: null,
        };
            if(typeof el.onSwipeEnd === "function") el.onSwipeEnd();
        });
    };


    // function to handle mouse swipe
    function mouse(el) {
        let ele = el.element === null ? window : el.element;
        ele.addEventListener("mousedown", e => {
            el.data.origin = {x: e.clientX, y: e.clientY};
            el.data.isActve = true;
            if(typeof el.onSwipeStart === "function") el.onSwipeStart();
        });
        
        ele.addEventListener("mousemove", e => {
            if(el.data.isActve) {
                let getDiffDir = getSwipeDirection(el.data.origin, {x: e.clientX, y:e.clientY});
                let newData = {
                    mouse: e,
                    currentPos: {x:e.clientX, y:e.clientY},
                    diffPos: getDiffDir[0],
                    direction: getDiffDir[1],
                    angle: Math.atan2(getDiffDir[0].y, getDiffDir[0].x)
                }
                el.data = newData;
                if(typeof el.onSwipeMove === "function") el.onSwipeMove();
            }
        });
        
        ele.addEventListener("mouseup", e => {
        el.data = {
            origin: {x: null, y: null},
            currentPos: {x:e.clientX, y:e.clientY},
            isActive: false,
            direction: null,
        };
            if(typeof el.onSwipeEnd === "function") el.onSwipeEnd();
        });
    };


    function Swipe(element, type, single) {
        this.element = element || null;
        this.single = single;
        // functions
        this.data = {};
        this.onStart = null;
        this.onMove = null;
        this.onEnd = null;
        
        if(type === "default") {
            mouse(this);
            if(this.single) singleTouch(this);
            else multiTouch(this);
        } else if(type === "touch") {
            if(single) singleTouch(this);
            else multiTouch(this);
        } else if(type === "mouse") {
            mouse(this);
        }        
    }

    return new Swipe(element, type, single);

});