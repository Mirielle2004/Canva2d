const Canva2D = (function() {

    return {
        API: {
            get author() {return "CodeBreaker"},
            get date() {return "18th Dec. 2020"},
            get version() {return "v0.0.15-alpha"}
        },
        getAPI() {
            return this.API;
        }
    };

})();