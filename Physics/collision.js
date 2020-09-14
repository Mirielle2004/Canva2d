/**
 * @description
 * principal class containing various set of collision utility functions
 * 
 */
class Collision {

    /**
     * @description checks collison between two circles
     * @param {Component} c1 circle component with a defined x, y, r
     * @param {Component} c2 circle component with a defined x, y, r
     * 
     */
    static circle(c1, c2) {
        return Vector.getDist(c1, c2) < c1.r + c2.r;
    }

    /**
     * @description checks collison between two rectangles
     * @param {Component} r1 rectangle component with a defined x, y, w, h
     * @param {Component} r2 rectangle component with a defined x, y, w, h
     * 
     */
    static rect(r1, r2) {
        return r1.x + r1.w > r2.x && r2.x + r2.w > r1.x 
        && r1.y + r1.h > r2.y && r2.y + r2.h > r1.y;
    }

    /**
     * @description checks collison between a rectangle and a circle
     * @param {Component} r rectangle component with a defined x,y,w,h
     * @param {Component} c circle component with a defined x, y, r
     * 
     */
    static rectCircle(r, c) {
        var dx = Math.abs(c.x - (r.x + r.w * .5));
        var dy = Math.abs(c.y - (r.y + r.h * .5));

        if(dx > c.r + r.w * .5) return false;
        if(dy > c.r + r.h * .5) return false;

        if(dx <= r.w) return true;
        if(dy <= r.h) return true;

        var dx = dx - r.w;
        var dy = dy - r.h;
        return (dx * dx + dy * dy <= c.r * c.r);
    }

    /**
     * @description checks if two lines are intersecting
     * @param {Component} l1 line component with a defined x0, y0, x1, y1
     * @param {Component} l2 line component with a defined x0, y0, x1, y1
     * 
     */    
    static lineIntercept(l1, l2) {
        let v1, v2, v3, cross, u1, u2;

        v1 = new Vector(l1.x1, l1.y1)
            .subtract({x: l1.x0, y: l1.y0});
        v2 = new Vector(l2.x1, l2.y1)
            .subtract({x: l2.x0, y: l2.y0});
        if((cross = v1.x * v2.y - v1.y * v2.x) === 0) {
            return false;
        }
        v3 = {x: l1.x0 - l2.x0, y: l1.y0 - l2.y0};
        u2 = (v1.x * v3.y - v1.y * v3.x) / cross;

        if(u2 >= 0 && u2 <= 1) {
            u1 = (v2.x * v3.y - v2.y * v3.x) / cross;
            return (u1 >= 0 && u1 <= 1);
        }
        return false;
    }

    /**
     * @description checks if a line is intersecting with a circle
     * @param {Component} l line component with a defined x0, y0, x1, y1
     * @param {Component} c circle component with a defined x, y, r
     * 
     */
    static lineInterceptCircle(l, c) {

        let diffA = new Vector(c.x, c.y).subtract({x: l.x0, y: l.y0});
        let diffB = new Vector(l.x1, l.y1).subtract({x: l.x0, y: l.y0});
        let dot = diffA.dot(diffB) / diffB.dot(diffB);
        
        let x = l.x0 + diffB.x * dot;
        let y = l.y0 + diffB.y * dot;

        if(dot < 0) {
            x = l.x0;
            y = l.y0;
        }

        if(dot > 1) {
            x = l.x1;
            y = l.y1;
        }
        let res = new Vector(c.x - x, c.y - y).dot({x: c.x - x, y: c.y - y});
        return res < c.r * c.r;
    }

    /**
     * @description checks if a line is intersecting with a rect
     * @param {Component} l line component with a defined x0, y0, x1, y1
     * @param {Component} r rect component with a defined x, y, w, h
     * 
     */
    static lineInterceptRect(l, r) {

        const lineSegmentCollide = (l1, l2) => {
            let p0 = {x: l1.x0, y: l1.y0};
            let p1 = {x: l1.x1, y: l1.y1};
            let p2 = {x: l2.x0, y: l2.y0};
            let p3 = {x: l2.x1, y: l2.y1};
            let unknownA = (p3.x - p2.x) * (p0.y - p2.y) - (p3.y - p2.y) * (p0.x - p2.x);
            let unknownB = (p1.x - p0.x) * (p0.y - p2.y) - (p1.y - p0.y) * (p0.x - p2.x);
            let denominator = (p3.y - p2.y) * (p1.x - p0.x) - (p3.x - p2.x) * (p1.y - p0.y);

            if(unknownA == 0 && unknownB == 0 && denominator == 0) return null;

            if(denominator == 0) return null;

            unknownA /= denominator;
            unknownB /= denominator;

            let intersecting = (unknownA >= 0 && unknownA <= 1 && unknownB >= 0 && unknownB <= 1);
            return intersecting;
        };

        // top rect line
        var q = {x0: r.x, y0: r.y, x1: r.x + r.w, y1: r.y + r.h};
        if(lineSegmentCollide(l, q)) return true;

        // right rect line
        var q = {x0: r.x + r.w, y0: r.y + r.h, x1: r.x + r.w, y1: r.y + r.h};
        if(lineSegmentCollide(l, q)) return true;

        // bottom rect line
        var q = {x0: r.x + r.w, y0: r.y + r.h, x1: r.x, y1: r.y + r.h}
        if(lineSegmentCollide(l, q)) return true;

        // left rect line
        var q = {x0: r.x, y0: r.y + r.h, x1: r.x, y1: r.y};
        if(lineSegmentCollide(l, q)) return true;

        return false;
    }

    /**
     * @description checks if a vector is in an arc
     * @param {Vector} v vector with a defined x, y
     * @param {Object} arc arc infomations.
     * {x, y, angle0, angle1, r1, r2}. 
     * [x, y] is the position of the arc.
     * [angle0, angle1] are the starting and ending angles respectively.
     * [r0, r1] are the inner and outer radius of the arc respectiively.
     * 
     */
    static pointAtArc(v, arc) {
        let diff = new Vector(v.x, v.y).subtract({x:arc.x, y: arc.y});
        let dxy = diff.dot(diff);
        let oR = arc.r1 * arc.r1;   // outer radius
        let iR = arc.r0 * arc.r0;   // inner radius
        if(dxy < iR || dxy > oR) return false;
        let angle = (diff.angle + Math.PI * 2) % (Math.PI * 2);
        return angle >= arc.angle0 && angle <= arc.angle1;
    }

    /**
     * @description checks if a vector is in a wedge
     * @param {Vector} v vector with a defined x, y
     * @param {Object} w wedge informations that must include
     * [x, y, r, angle0, angle1].. angle0 and angle1 are the 
     * starting angle and ending angle respectively.
     * 
     */
    static pointAtWedge(v, w) {
        let diff = new Vector(v.x, v.y).subtract(
            {x: w.x, y: w.y});
        let rr = w.r * w.r;
        if(diff.x * diff.x + diff.y * diff.y > rr) return false;
        let angle = (diff.angle + Math.PI * 2) % (Math.PI * 2);
        return angle >= w.angle0 && angle <= w.angle1;
    }

    /**
     * @description checks if a vector is in a circle
     * @param {Vector} v vector with a defined x, y
     * @param {Component} c circular components with a defined x, y, r
     * 
     */
    static pointAtCircle(v, c) {
        let diff = new Vector(c.x, c.y).subtract({
            x: v.x, y: v.y});
        return (diff.x * diff.x + diff.y * diff.y < c.r * c.r);
    }

    /**
     * @description checks if a vector is in a semi-circle
     * @param {Vector} v vector with a defined x, y
     * @param {Component} c circular components with a defined x, y, r
     * 
     */
    static pointAtCircleCentre(v, c) {
        let diff = new Vector(c.x, c.y).subtract({
            x: v.x, y: v.y});
        return (diff.x * diff.x + diff.y * diff.y < c.r);
    }

    /**
     * @description checks if a point is in a rectangle
     * @param {Vector} v vector with a defined x, y
     * @param {Component} r rectangular component with a defined x, y, w, h
     * 
     */
    static pointAtRect(v, r) {
        return v.x > r.x && v.x < r.x + r.w && v.y > r.y && v.y < r.y + r.h;
    }

    /**
     * @description checks if a point is in quater of a rect
     * @param {Vector} v vector with a defined x, y
     * @param {Component} r rectangular component with a defined x, y, w, h
     * 
     */
    static pointAtSemiRect(v, r) {
        return v.x > r.x && v.x < r.x + r.w * .05 && v.y > r.y && v.y < r.y + r.h * .05;
    }

    static elastic(b1, b2) {

        const axisRotation = (v, angle) => ({
            x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
            y: v.x * Math.sin(angle) + v.y * Math.cos(angle)
        });

        let velDiff = new Vector(b1.vel.x, b1.vel.y)
            .subtract({x: b2.vel.x, y: b2.vel.y});
        let vecDiff = new Vector(b2.x, b2.y)
            .subtract({x: b1.x, y: b1.y});
        // if objects aren't overlapping
        if(vecDiff.dot(velDiff) >= 0) {
            let angle = -Math.atan2(vecDiff.y, vecDiff.x);

            // mass
            const m1 = b1.m;  
            const m2 = b2.m;

            // grab initial vel
            const u1 = axisRotation(b1.vel, angle);
            const u2 = axisRotation(b2.vel, angle);

            // calculate the final velocity
            const v1 = { x:(((m1 - m2) * u1.x) / (m1 + m2)) + ((2 * m2) * u2.x) / (m1 + m2),
                y: u1.y};
            const v2 = {x:(((2 * m1)*u1.x) / (m1 + m2)) + (((m2 - m1) * u2.x) / (m1 + m2)), 
                y: u2.y};
            
            const finalVel1 = axisRotation(v1, -angle);
            const finalVel2 = axisRotation(v2, -angle);

            b1.vel = new Vector(finalVel1.x, finalVel1.y);
            b2.vel = new Vector(finalVel2.x, finalVel2.y);
        }
    }
}
