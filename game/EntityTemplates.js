entityTemplates = {};

entityTemplates.player = function(username, uuid) {
	var entity = entityTemplates.createEntity(uuid);
	
	var physicsWorld = (isServer ? server.physicsWorld : game.physicsWorld);
	var entityWorld = (isServer ? server.entityWorld : game.entityWorld);
	
	// Control
	var control = new ECS.Components.Control();
	entity.addComponent(control);

	// Health
	var health = new ECS.Components.Health(100.0);
	entity.addComponent(health);

	// Physics
	var physicsBody = new PhysicsBody();

	physicsWorld.addBody(physicsBody);
	entity.addComponent(new ECS.Components.Physics(physicsBody));
	entity.addComponent(new ECS.Components.Player(username));
	
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
		
		var drawable = new ECS.Components.Drawable(game.stage, bodyparts, game.animationManager);
		var text = new PIXI.Text(username, { fill: '#ffffff' });
		drawable.addSprite("username", text, v2.create(- text.width / 2, -80), false);
		
		var healthbarSprite = new PIXI.Sprite(game.textureManager.textures.healthbar);
		healthbarSprite.anchor.x = 0.5;
		healthbarSprite.anchor.y = 0.5;
		health.sprite = healthbarSprite;
		drawable.addSprite("healthbar", healthbarSprite, v2.create(0, -50), false);
			
		entity.addComponent(drawable);
		entity.addComponent(new ECS.Components.Interpolation());
	}

	entityWorld.addEntity(entity);
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
		
		var drawable = new ECS.Components.Drawable(game.stage, bodyparts, game.animationManager);
		
		var healthbarSprite = new PIXI.Sprite(game.textureManager.textures.healthbar);
		healthbarSprite.anchor.x = 0.5;
		healthbarSprite.anchor.y = 0.5;
		health.sprite = healthbarSprite;
		//drawable.addSprite("healthbar", healthbarSprite, v2.create(0, -50), false);
		
		//entity.addComponent(drawable);
		entity.addComponent(new ECS.Components.Interpolation());
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