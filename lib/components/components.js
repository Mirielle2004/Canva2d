const Component = {

    Shape: function(type, pos, dimension) {
        return new ShapeComponent(type, pos, dimension);
    },

    Basic: function(type, pos, dimension) {
        return new ShapeComponent(type, pos, dimension);
    },
    
    Sprite: function(frames, col, delay=5) {
        return new SpriteComponent(frames, col, delay);
    },
    
    Tile: function(pos, dimension) {
        return new TileComponent(pos, dimension);
    }

};