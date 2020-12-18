{
    Canva2D.API.PhysicsDecorator = function(object, values) {
        if(!object.initPhysicsDecorator) 
            object.initPhysicsDecorator = false;
        let params = [
            "velocity",
            "mass",
            "rotation",
            "force",
            "friction",
            "gravity",
            "speed",
            "acceleration"
        ];
        let res = {};
        params.forEach(p => res[p] = null);
        if(!object.initPhysicsDecorator) {
            for(const key in values) {
                if(res[key] !== undefined) {
                    res[key] = values[key];
                } else {
                    console.warn(`Invalid Physics Key Rejected: "${key}"`);
                }
            }
            Object.setPrototypeOf(object, res);
            object.initPhysicsDecorator = true;
        } else {
            throw new Error("Fail to add new Physics decorator: This function must be called once");
        }
    };



    Canva2D.API.ShapesDecorator = function(object, type, values) {
        if(!object.initShapesDecorator) 
            object.initShapesDecorator = false;
        let params;
        if(type === "circle") {
            params = [
                "pos",
                "r"
            ]
        } else if(type === "rect") {
            params = [
                "pos",
                "dimension"
            ]
        }
        let res = {};
        params.forEach(p => res[p] = null);
        if(!object.initShapesDecorator) {
            for(const key in values) {
                if(res[key] !== undefined) {
                    res[key] = values[key];
                } else {
                    console.warn(`Invalid Shape Key Rejected: "${key}"`);
                }
            }
            Object.setPrototypeOf(object, res);
            object.initShapesDecorator = true;
        } else {
            throw new Error("Fail to add new Shape decorator: This function must be called once");
        }
    };



};