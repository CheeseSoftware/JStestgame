GamePrototype = function() {
	this.preload();
	this.connection = new Connection(GP.ip, 3000);
	
	// Initialize window
	this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0xF00000}, true, false);
	this.renderer.clearBeforeRender = false;
	document.body.appendChild(this.renderer.view);
	this.stage = new PIXI.Container();
	this.camera = new Camera(this.stage);	
	this.camera.zoom = 1.0;
	
	/*for(var x = 0; x < this.tileMap.width; ++x) {	
		this.tileMap[x] = [];		
		for(var y = 0; y < this.tileMap.height; ++y) {
			var sprite = new PIXI.Sprite(this.textures.cheese);
			sprite.position.x = x * this.tileSize;
			sprite.position.y = y * this.tileSize;
			this.stage.addChild(sprite);
			this.tileMap[x][y] = { sprite: sprite, health: 100};
		}
	}*/
	
	this.entityWorld = new CES.World();
	// Add more systems here!
	
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	
	this.keys = {};
	this.keys.left = GP.keyboard(37);
	this.keys.up = GP.keyboard(38);
	this.keys.right = GP.keyboard(39);
	this.keys.down = GP.keyboard(40);
	
	this._intervalId = setInterval(function(){game.run()}, 0);
	
	this.mousex = null;
	this.mousey = null;
	document.addEventListener('mousemove', this.onMouseUpdate, false);
	document.addEventListener('mouseenter', this.onMouseUpdate, false);
	
	window.addEventListener('resize', this.resize, false);
	
	this.players = {};
	
	this.lastUpdate = Date.now();
	
	
}





GamePrototype.prototype.onMouseUpdate = function (e) {
	mousex = e.pageX;
	mousey = e.pageY;
}


GamePrototype.prototype.resize = function() {
	this.renderer.resize(window.innerWidth, window.innerHeight);
	this.camera.width = window.innerWidth;
	this.camera.height = window.innerHeight;

}

GamePrototype.prototype.preload = function() {
	this.textures = {};
	this.textures.cheese = PIXI.Texture.fromImage('textures/cheese.png');
	this.textures.worker = PIXI.Texture.fromImage('textures/worker.png');
	this.textures.ground = PIXI.Texture.fromImage('textures/ground.png');
	this.textures.block = PIXI.Texture.fromImage('textures/block.png');
	this.textures.rock = PIXI.Texture.fromImage('textures/rock.png');
}




GamePrototype.prototype.run = function() {
    var now = Date.now();
    var dt = now - this.lastUpdate;
	this.lastUpdate = Date.now();

	
    this.entityWorld.update(dt);
	this.camera.update(dt);
	
	
	var gl = this.renderer.gl;
	this.renderer.setRenderTarget(this.renderer.renderTarget);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// TODO: Render terrain.
	
	this.renderer.render(this.camera);
	
};

GamePrototype.prototype.sendUpdatePacket = function() {
	var physics = this.player.getComponent('physics');
	var player = this.player.getComponent('player');
	this.connection.send('playerupdate', { 
		name: player.username,
		x: physics.x,
		y: physics.y,
		vx: physics.vx,
		vy: physics.vy,
		rotation: physics.rotation
	});
}

GamePrototype.prototype.spawnPlayer = function(name) {
	var sprite = new PIXI.Sprite(this.textures.worker);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.position.x = Math.random() * this.tileMap.width * this.tileSize;
	sprite.position.y = Math.random() * this.tileMap.height * this.tileSize;	
	var text = new PIXI.Text(name, { fill: '#ffffff' });
	
	var player = new CES.Entity();
	player.addComponent(new ECS.Components.Player(name, sprite, text));
	player.addComponent(new ECS.Components.Physics(sprite.position.x, sprite.position.y, 0, 0, 0));
	this.entityWorld.addEntity(player);
	this.stage.addChild(sprite);
	this.stage.addChild(text);
	this.players[name] = player;
	return player;
}

GamePrototype.prototype.spawnMainPlayer = function() {
	this.connection.send('playerinit', { 
		name: "player username that will be selected when accounts exist"
	});
}

GamePrototype.prototype.despawnPlayer = function(name) {
	var player = this.players[name];
    var player = player.getComponent('player');
	this.stage.removeChild(player.sprite);
	this.stage.removeChild(player.text);
	delete(this.players[name]);
}


