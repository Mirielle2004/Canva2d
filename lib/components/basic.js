class ShapeComponent {

	constructor(type, pos, dimension) {
		this.validTypes = [
			"rect", 
			"circle",
			"line",
			"polygon"
		];
		if(!(this.validTypes.some(i => i === type)))
			throw TypeError(`Failed to create Component, valid type 
				must be from ${this.validTypes}`);
		this.type = type;

		if(this.type === "rect") {
			this.pos = Vector2.createFrom(pos);
			this.dimension = Vector2.createFrom(dimension);
		} 
		else if(this.type === "circle") {
			this.pos = Vector2.createFrom(pos);
			this.r = dimension;
		} 
		else if(this.type === "line") {
			this.start = Vector2.createFrom(pos);
			this.end = Vector2.createFrom(dimension);
		} 
		else if(this.type === "polygon") {
			this.pos = Vector2.createFrom(pos);
			this.vertices = [];
			if(dimension instanceof Array) {
				if(dimension[0][0] !== undefined) {
					dimension.forEach(data => {
						this.vertices.push(Vector2.createFrom(data));
					});
				}
			}
		}
		
	}


}