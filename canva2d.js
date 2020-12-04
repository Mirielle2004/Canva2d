/**
 * 
 * @author Mirielle S.
 * @name: Canva2D.js
 * @description A simple HTML5 Canvas game Engine
 * Last Revision: 3rd Dec. 2020
 * 
 * 
 * MIT License 
 * Copyright (c) 2020 CodeBreaker
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const Canva2d = {
    
    loaded: false,
    
    host: "https://cdn.jsdelivr.net/gh/Mirielle2004/Canva2d@v0.0.8-alpha",
    
    debug: false,
    
    cache: {},

    load(services) {
        if(document.readyState === "complete")
            throw new Error("Engine Must be loaded before window's contents");
        // available services
        let ext = this.debug ? '.js' : '.min.js';
        let base_dir = this.debug ? "." : this.host;
        
        // all available classes
        let _servicesAvail = {
            launcher: `${base_dir}/lib/core/launcher${ext}`,
            preloader: `${base_dir}/lib/core/preloader${ext}`,
            scene: `${base_dir}/lib/core/scene${ext}`,
            
        };
        
        // make sure cdn are loaded once
        if(!this.loaded) {
            let head = document.querySelector("head");
            
            services.forEach(service => {
                if(_servicesAvail.hasOwnProperty(service)) {
                    let script = document.createElement("SCRIPT");
                    script.src = _servicesAvail[service];
                    head.appendChild(script);
                } else {
                    console.error(`Failed to Load Package: ${service}`)
                }
            });
            this.loaded = true;
        }
    },
    
    $(id) {
        return document.querySelector(id);
    },
    
    $all(id) {
        return document.querySelectorAll(id);
    },
    
    randFromArray(array) {
        return array[~~(Math.random() * array.length)];
    }
    
};



window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000/60);
    }
})();


// HTML Element
Object.defineProperties(HTMLElement.prototype, {
   
    css: {
		value: function(styles) {
			if(!styles instanceof Object) 
				throw new Error(`CSS Styling data must be an instanceof an Object`)
			let res = "";
			for(const key in styles) {
				this.style[key] = styles[key];
			}
		},
        configurable: true
	},

	attr: {
		value: function(attrs) {
			if(!attrs instanceof Object) 
				throw new Error(`ATTR data must be an instanceof an Object`)
			for(const key in attrs) {
				this[key] = attrs[key];
			}
		},
        configurable: true
	}
    
});


// Math Object
Object.defineProperties(Math, {

	degToRad: {
		value:function(number) {
			return number * this.PI / 180;
		},
        configurable: true,
	},

	radToDeg: {
		value: function(number) {
			return number * 180 / this.PI;
		},
        configurable: true,
	},

	isEven: {
		value: function(number) {
			return !(number & 1)
		},
        configurable: true,
	},

	randRange: {
		value: function(min, max) {
			return this.random() * (max - min + 1) + min;
		},
        configurable: true,
	},

	clamp: {
		value: function(min, max, val) {
			return this.min(this.max(min, +val), max);
		},
        configurable: true,
	}
    
});