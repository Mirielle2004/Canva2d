// from goalKicker.com HTML5 Canvas Note for professional
class Collision {

	/**
	* @method circle
	* @checks for collisions between two circles
	* @param {Any} c1 the first circle
	* @param {Any} c2 the second circle
	* circle = {pos: , r:}
	*/
	static circle(c1, c2) {
		let diff = Vector2.createFrom(c2.pos).sub(Vector2.createFrom(c1.pos));
		return diff.length <= c1.r + c2.r;
	}
	/**
	* @method rect
	* @checks for collisions between two rectangles
	* @param {Any} r11 the first rectangle
	* @param {Any} r22 the second rectangle
	* rect = {pos: , dimension:}
	*/
	static rect(r11, r22) {
		let r1 = Component.Basic("rect", r11.pos, r11.dimension);
		let r2 = Component.Basic("rect", r22.pos, r22.dimension);
		return r1.pos.x + r1.dimension.x > r2.pos.x && r2.pos.x + r2.dimension.x > r1.pos.x
		&& r1.pos.y + r1.dimension.y > r2.pos.y && r2.pos.y + r1.dimension.y > r1.pos.y;
	}
	/**
	* @method circleRect
	* @checks for collisions between circle and a rectangle
	* @param {Any} c1 the circle
	* @param {Any} r1 the rectangle
	* circle = {pos, r}
	* rect = {pos: , dimension:}
	*/
	static circleRect(c1, r1) {
		let c = Component.Basic("circle", c1.pos, c1.r);
		let r = Component.Basic("rect", r1.pos, r1.dimension);
		let diff = {
			x: Math.abs(c.pos.x - (r.pos.x + r.dimension.x * 0.5)),
			y: Math.abs(c.pos.y - (r.pos.y + r.dimension.y * 0.5))
		};
		if(diff.x > c.r + r.dimension.x * 0.5) return false;
		if(diff.y > c.r + r.dimension.y * 0.5) return false;
		if(diff.x <= r.dimension.x) return true;
		if(diff.y <= r.dimension.y) return true;
		let dx = diff.x - r.dimension.x;
		let dy = diff.y - r.dimension.y;
		return Math.hypot(dx, dy) <= c.r * c.r;
	}
	/**
	* @method lineIntercept
	* @checks if two line segment are intercepting
	* @param {Any} l1 the first line
	* @param {Any} l2 the second line
	* line = {start: , end: }
	*/
	static lineIntercept(l11, l22) {
		let l1 = Component.Basic("line", l11.start, l11.end);
		let l2 = Component.Basic("line", l22.start, l22.end);

		function lineSegmentsIntercept(l1, l2) {
			let v1 = l1.end.sub(l1.start);
			let v2 = l2.end.sub(l2.start);
			let v3 = {x: null, y: null};
			let cross, u1, u2;

			if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
				return false;
			}
			v3 = l1.start.sub(l2.start);
			u2 = (v1.x * v3.y - v1.y * v3.x) / cross;
			if(u2 >= 0 && u2 <= 1) {
				u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
				return u1 >= 0 && u1 <= 1;
			}
			return false;
		}

		return lineSegmentsIntercept(l1, l2);
	}
	/**
	* @method pointAtLineIntercept
	* @checks if two line segment are intercepting
	* @param {Any} l1 the first line
	* @param {Any} l2 the second line
	* line = {start: , end: }
	*/
	static pointAtLineIntercept(l11, l22) {
		let l1 = Component.Basic("line", l11.start, l11.end);
		let l2 = Component.Basic("line", l22.start, l22.end);

		function lineSegmentsIntercept(l1, l2) {
			let v1 = l1.end.sub(l1.start);
			let v2 = l2.end.sub(l2.start);
			let v3 = {x: null, y: null};
			let cross, u1, u2;

			if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
				return false;
			}
			v3 = l1.start.sub(l2.start);
			u2 = (v1.x * v3.y - v1.y * v3.x) / cross;
			if(u2 >= 0 && u2 <= 1) {
				u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
				if(u1 >= 0 && u1 <= 1) {
					return l1.start.addScale(v1, u1);
				}
			}
			return false;
		}

		return lineSegmentsIntercept(l1, l2);
	}
	/**
	* @method lineInterceptCircle
	* @checks if a line intercepts a circle
	* @param {Any} l1 the line
	* @param {Any} c1 the circle
	* line = {start: , end: }
	* circle = {pos:, r:}
	*/
	static lineInterceptCircle(l1, c1) {
		let l = Component.Basic("line", l1.start, l1.end);
		let c = Component.Basic("circle", c1.pos, c1.r);
		let diff = c.pos.sub(l.start);
		let ndiff = l.end.sub(l.start);
		let t = diff.dot(ndiff) / (ndiff.x * ndiff.x + ndiff.y * ndiff.y);
		let nPoint = l.start.addScale(ndiff, t);
		if(t < 0) {
			nPoint.x = l.start.x;
			nPoint.y = l.start.y
		}
		if(t > 1) {
			nPoint.x = l.end.x;
			nPoint.y = l.end.y	
		}
		return (c.pos.x - nPoint.x) * (c.pos.x - nPoint.x) + (c.pos.y - nPoint.y) * (c.pos.y - nPoint.y) < c.r * c.r;
	}
	/**
	* @method lineInterceptRect
	* @checks if a line intercepts a rectangle
	* @param {Any} l1 the line
	* @param {Any} r1 the rectangle
	* line = {start: , end: }
	* circle = {pos:, dimension:}
	*/
	static lineInterceptRect(l1, r1) {
		let l = Component.Basic("line", l1.start, l1.end);
		let r = Component.Basic("rect", r1.pos, r1.dimension);

		function lineSegmentsIntercept(p0, p1, p2, p3) {
			var unknownA = (p3.x-p2.x) * (p0.y-p2.y) - (p3.y-p2.y) * (p0.x-p2.x);
			var unknownB = (p1.x-p0.x) * (p0.y-p2.y) - (p1.y-p0.y) * (p0.x-p2.x);
			var denominator = (p3.y-p2.y) * (p1.x-p0.x) -(p3.x-p2.x) * (p1.y-p0.y);

			if(unknownA==0 && unknownB==0 && denominator==0) return(null);
			if (denominator == 0) return null;

			unknownA /= denominator;
			unknownB /= denominator;
			var isIntersecting=(unknownA>=0 && unknownA<=1 && unknownB>=0 && unknownB<=1)
			return isIntersecting;
		}

		let p = {x: l.start.x, y: l.start.y};
		let p2 = {x: l.end.x, y: l.end.y};

		let q = r.pos;
		let q2 = {x: r.pos.x + r.dimension.x, y: r.pos.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		q = q2;
		q2 = {x: r.pos.x + r.dimension.x, y: r.pos.y + r.dimension.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		q = q2;
		q2 = {x: r.pos.x, y: r.pos.y + r.dimension.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		q = q2;
		q2 = {x: r.pos.x, y: r.pos.y};
		if(lineSegmentsIntercept(p, p2, q, q2)) return true;
		return false;
	}
	/**
	* @description checks if the point[x, y] is in an arc
	* @param {Vector2} p point to be checked
	* @param {Object} arc arc data
	// arc objects: {pos,innerRadius:,outerRadius:,startAngle:,endAngle:}
	// Return true if the x,y point is inside an arc
	*/
	static isPointInArc(p, arc) {
		if(arc.pos === undefined || arc.innerRadius === undefined || arc.outerRadius 
		=== undefined || arc.startAngle === undefined || arc.endAngle === undefined)
			throw new Error(`Insufficient Arc data: Must provide a "pos, innerRadius, outerRadius, startAngle, endAngle"`);
		let diff = p.sub(Vector2.createFrom(arc.pos));
		let rOuter = arc.outerRadius;
		let rInner = arc.innerRadius;
		if(diff.length < rInner || diff.length > rOuter) return false;
		let angle = (diff.angle + Math.PI * 2) % Math.PI*2;
		return angle >= arc.startAngle && angle <= arc.endAngle;
	}
	/**
	* @description checks if the point[x, y] is in a wedge
	* @param {Vector2} p point to be checked
	* @param {Object} wedge wedge data
	// wedge objects: {pos:,r:,startAngle:,endAngle:}
	// Return true if the x,y point is inside the closed wedge
	*/
	static isPointInWedge(p, wedge) {
		if(wedge.pos === undefined || wedge.r === undefined || wedge.startAngle === undefined)
			throw new Error(`Insufficient Wedge's data: Must provide a "pos, r, startAngle"`);
		let PI2 = Math.PI * 2;
		let diff = p.sub(wedge.pos);
		let r = wedge.r * wedge.r;
		if(diff.length > r) return false;
		let angle = (diff.angle + PI2) % PI2;
		return angle >= wedge.startAngle && angle <= wedge.endAngle;
	}
	/**
	* @description checks if the point[x, y] is in a circle
	* @param {Vector2} p point to be checked
	* @param {Vector2} c circle component
	*/
	static isPointInCircle(p, c) {
		let diff = p.sub(c.pos);
		return (diff.length < c.r * c.r);
	}
	/**
	* @description checks if the point[x, y] is in a rect
	* @param {Vector2} p point to be checked
	* @param {Vector2} c rect component
	*/
	static isPointInRect(p, r) {
		return (p.x > r.pos.x && p.x < r.pos.x + r.dimension.x 
			&& p.y > r.pos.y && p.y < r.pos.y + r.dimension.y);
	}
	
}