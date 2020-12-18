Canva2D.API.touch = (function(element=window) {

    let cache = [];

    class Touch {
        constructor() {
            this.touchCache = [];

            element.addEventListener("touchstart", e => {
                for(let i=0; i < e.targetTouches.length; i++)
                    this.touchCache.push(e.targetTouches);
            });
        }
    };

    return new Touch();

});