
ECS.Components.Physics = function PhysicsComponent ( params ){
    params = params || {};
	
    this.x = params.x;
    this.y = params.y;

    return this;
};
ECS.Components.Physics.prototype.name = 'physics';