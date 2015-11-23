entityTemplates = {};

entityTemplates.player = function(username, uuid) {
	var entity = entityTemplates.createEntity(uuid);
	
	var physicsWorld = (isServer ? server.physicsWorld : game.physicsWorld);
	
	// Physics
	var fixDef = new b2FixtureDef;
	//fixDef.filter.maskBits = 0x0000;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	fixDef.shape = new b2CircleShape(constants.playerFatness);
	bodyDef.position.Set(10, 400 / 30 + 1.8);
	var physicsBody = physicsWorld.CreateBody(bodyDef);
	physicsBody.CreateFixture(fixDef);
	
	entity.addComponent(new ECS.Components.Physics(physicsBody));
	
	if(!isServer) {
		var sprite = new PIXI.Sprite(game.textureManager.textures.feet);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		
		var bodySprite = new PIXI.Sprite(game.textureManager.textures.dig);
		bodySprite.anchor.x = 0.5;
		bodySprite.anchor.y = 0.5;
		
		var bodyparts = {
			"feet": {
				"sprite": sprite
			},
			"body": {
				"sprite": bodySprite
			}
		};
		
		var text = new PIXI.Text(username, { fill: '#ffffff' });
		
		entity.addComponent(new ECS.Components.Player(username, text));
		var drawable = new ECS.Components.Drawable(bodyparts, game.animationManager, 0, 0);
		entity.addComponent(drawable);
		
		game.stage.addChild(sprite);
		game.stage.addChild(bodySprite);
		game.stage.addChild(text);
		game.entityWorld.addEntity(entity);
	}
	else {
		server.entityWorld.addEntity(entity);
		entity.addComponent(new ECS.Components.ServerPlayer());
	}
	
	return entity;
}

entityTemplates.worker = function(uuid) {
	var entity = entityTemplates.createEntity(uuid);
	entity.type = "worker";
	
	var physicsWorld = (isServer ? server.physicsWorld : game.physicsWorld);
	var entityWorld = (isServer ? server.entityWorld : game.entityWorld);
	
	// Physics
	var fixDef = new b2FixtureDef;
	//fixDef.filter.maskBits = 0x0000;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	fixDef.shape = new b2CircleShape(constants.playerFatness);
	bodyDef.position.Set(10, 400 / 30 + 1.8);
	var physicsBody = physicsWorld.CreateBody(bodyDef);
	physicsBody.CreateFixture(fixDef);
	
	var physics = new ECS.Components.Physics(physicsBody);
	physics.moveSpeed = 4.0;
	entity.addComponent(physics);
	
	if(!isServer) {
		var sprite = new PIXI.Sprite(game.textureManager.textures.worker);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		
		var bodyparts = {
			"body": {
				"sprite": sprite
			}
		};
		
		entity.addComponent(new ECS.Components.Drawable(bodyparts, game.animationManager, 0, 0));
		game.stage.addChild(sprite);
	}
	else
		entity.addComponent(new ECS.Components.AI());
	
	entityWorld.addEntity(entity);
	return entity;
}


entityTemplates.createEntity = function(uuid) {
	if(isServer)
		return server.entityServer.createEntity(uuid);
	else
		return game.entityClient.createEntity(uuid);
}