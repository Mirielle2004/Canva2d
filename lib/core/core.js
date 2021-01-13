window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000/60);
    }
})();



Object.defineProperties(HTMLElement.prototype, {
	// set styling to an HTML Element when called element.css({...styling});
    css: {
		value: function(styles) {
			if(!styles instanceof Object) 
				throw new Error(`CSS Styling data must be an instanceof an Object`)
			let res = "";
			for(const key in styles)
				this.style[key] = styles[key];
		},
		configurable: true,
		writable: false,
	},
	// set attributes to an HTML Element when called element.attr({..attributea});
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



Object.defineProperties(Math, {
	// convert from degree to radian
	degToRad: {
		value:function(number) {
			return number * this.PI / 180;
		},
		configurable: true,
		writable: false
	},
	// convert from radian to degree
	radToDeg: {
		value: function(number) {
			return number * 180 / this.PI;
		},
		configurable: true,
		writable: false
	},
	// check if a number is even or odd
	isEven: {
		value: function(number) {
			return !(number & 1)
		},
		configurable: true,
		writable: false
	},
	// return a random number between min-max
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

	// get random item from an array
	randFromArray: {
		value: array => array[~~(Math.random() * array.length)],
		writable: false
	},

	// creates an animation's instance;
	createAnimation: {
		value: function(func) {
			if(!(typeof func === "function"))
				throw new Error("Failed to create Animation's instance: Expects a function as it's first argument");
			let _Res = {};
			_Res.startTime = new Date().getTime();
			_Res.play = () => {
				_Res.state = "active";
				func();
				_Res.id = requestAnimationFrame(_Res.play);
			};
			_Res.pause = () => {
				_Res.state = "pause";
				cancelAnimationFrame(_Res.id);
			};
			return _Res;
		},
		writable: false
	}

});