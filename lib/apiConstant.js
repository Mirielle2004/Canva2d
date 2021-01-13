// contain Constants  
Object.defineProperties(Canva2D.API, {
    
    TOUCH: {value: "for_touch_based_devices"},
    MOUSE: { value: "for_mouse_based_devices"},
    DEFAULT: {value: "use_default"}, 
    
    MAP_CONSTRUCTOR: {value: "create a tilemMap"},
    STATIC_FUNCTIONS: {value: "get functions from a map"},

    ORTHORGONAL: { value: "right_angle_to_each_other"},
    ISOMETRIC: { value: "isometric_angle_to_each_other"},

    /**
     * Manipulate the console
     * call - Canva2D.API.CONSOLE("type", "message")
     */
    CONSOLE: {value: (key, message) => {
        if(window.console === undefined) 
            return ;
        if(typeof window.console[key] === "function")
            window.console[key](message);
        else window.console.warn(`console.${key}(...arg) is undefined`);
    }}


});