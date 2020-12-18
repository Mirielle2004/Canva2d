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
		configurable: true,
		writable: false,
	},

	attr: {
		value: function(attrs) {
			if(!attrs instanceof Object) 
				throw new Error(`ATTR data must be an instanceof an Object`)
			for(const key in attrs) {
				this[key] = attrs[key];
			}
		},
		configurable: true,
		writable: false,
	}
    
});


// Math Object
Object.defineProperties(Math, {

	degToRad: {
		value:function(number) {
			return number * this.PI / 180;
		},
		configurable: true,
		writable: false
	},

	radToDeg: {
		value: function(number) {
			return number * 180 / this.PI;
		},
		configurable: true,
		writable: false
	},

	isEven: {
		value: function(number) {
			return !(number & 1)
		},
		configurable: true,
		writable: false
	},

	randRange: {
		value: function(min=0, max=1) {
			return this.random() * (max - min + 1) + min;
		},
		configurable: true,
		writable: false
	}
    
});


/**
 * Basic Utility function
 * - calling method
 * Canva2D.API.$(identifier) ....
 */
Object.defineProperties(Canva2D.API, {
	$: {
		value: identifier => document.querySelector(identifier),
		writable: false
	},
	$all: {
		value: identifier => document.querySelectorAll(identifier),
		writable: false,
	},
	randFromArray: {
		value: array => array[~~(Math.random() * array.length)],
		writable: false
	}	
});