Math.__proto__ = {
    
    getPolarCoord(angle = 0, magnitude = 0) {
        let x = Math.cos(angle) * magnitude;
        let y = Math.sin(angle) * magnitude;
        return {x, y};
    }

}
