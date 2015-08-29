
ECS.Systems.RenderSystem = function RenderSystem ( entities ) {
	var curEntity, fillStyle; 
    for( var entityId in entities ){
        curEntity = entities[entityId];

        if( curEntity.components.texture && curEntity.components.physics ){
			var texture = curEntity.components.texture;
			var physics = curEntity.components.physics;
			Game.context.drawImage(curEntity.components.texture.img, physics.x, physics.y, texture.width, texture.height);
			
        }
    }
};