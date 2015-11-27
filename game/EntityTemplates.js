entityTemplates = {};

entityTemplates.player = function(username, uuid) {
	var entity = entityTemplates.createEntity(uuid);
	
	var physicsWorld = (isServer ? server.physicsWorld : game.physicsWorld);
	
	// Control
	var control = new ECS.Components.Control();
	entity.addComponent(control);

	// Health
	var health = new ECS.Components.Health(100.0);
	entity.addComponent(health);
	if (!isServer) {
		var sprite = new PIXI.Sprite(game.textureManager.textures.healthbar);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;

		health.sprite = sprite;
		game.stage.addChild(sprite);
	}

	// Physics
	var physicsBody = new PhysicsBody();

	physicsWorld.addBody(physicsBody);
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
		
		
		entity.addComponent(new ECS.Components.Player(username));
		var drawable = new ECS.Components.Drawable(bodyparts, game.animationManager, 0, 0);
		drawable.text = new PIXI.Text(username, { fill: '#ffffff' });
		entity.addComponent(drawable);
		entity.addComponent(new ECS.Components.Interpolation());
		
		game.stage.addChild(sprite);
		game.stage.addChild(bodySprite);
		game.stage.addChild(drawable.text);
		game.entityWorld.addEntity(entity);
	}
	else {
		server.entityWorld.addEntity(entity);
		entity.addComponent(new ECS.Components.Player());
	}
	
	return entity;
}

entityTemplates.worker = function(uuid) {
	var entity = entityTemplates.createEntity(uuid);
	entity.type = "worker";
	
	var physicsWorld = (isServer ? server.physicsWorld : game.physicsWorld);
	var entityWorld = (isServer ? server.entityWorld : game.entityWorld);
	
	// Control
	var control = new ECS.Components.Control();
	entity.addComponent(control);

	// Health
	var health = new ECS.Components.Health(10.0);
	entity.addComponent(health);
	if (!isServer) {
		var sprite = new PIXI.Sprite(game.textureManager.textures.healthbar);
		sprite.cropEnabled = true;
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;

		health.sprite = sprite;
		game.stage.addChild(sprite);
	}

	// Physics
	var physicsBody = new PhysicsBody();
	physicsBody.maxSpeed = 100;
	physicsWorld.addBody(physicsBody);
	var physics = new ECS.Components.Physics(physicsBody);
	//physics.acceleration = 500;
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
		entity.addComponent(new ECS.Components.Interpolation());
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