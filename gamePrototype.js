var mousex = null;
var mousey = null;

document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);

function onMouseUpdate(e) {
	mousex = e.pageX;
	mousey = e.pageY;
}

window.addEventListener('resize', resize, false);
function resize() {
	GP.renderer.resize(window.innerWidth, window.innerHeight);
	GP.camera.width = window.innerWidth;
	GP.camera.height = window.innerHeight;

}

GP.players = {};

GP.preload = function preload() {
	GP.textures = {};
	GP.textures.cheese = PIXI.Texture.fromImage('textures/cheese.png');
	GP.textures.worker = PIXI.Texture.fromImage('textures/worker.png');
	GP.textures.ground = PIXI.Texture.fromImage('textures/ground.png');
	GP.textures.block = PIXI.Texture.fromImage('textures/block.png');
	GP.textures.rock = PIXI.Texture.fromImage('textures/rock.png');
}

GP.create = function create() {
	GP.connection = new GP.connection(GP.ip, 3000);
	
	// Initialize window
	GP.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0x000000}, true, false);
	document.body.appendChild(GP.renderer.view);
	GP.stage = new PIXI.Container();
	GP.camera = new Camera(GP.stage);	
	GP.camera.zoom = 1.0;
	
	/*for(var x = 0; x < GP.tileMap.width; ++x) {	
		GP.tileMap[x] = [];		
		for(var y = 0; y < GP.tileMap.height; ++y) {
			var sprite = new PIXI.Sprite(GP.textures.cheese);
			sprite.position.x = x * GP.tileSize;
			sprite.position.y = y * GP.tileSize;
			GP.stage.addChild(sprite);
			GP.tileMap[x][y] = { sprite: sprite, health: 100};
		}
	}*/
	
	
	GP.entityWorld = new CES.World();
	// Add more systems here!
	
	GP.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	GP.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	
	GP.keys = {};
	GP.keys.left = GP.keyboard(37);
	GP.keys.up = GP.keyboard(38);
	GP.keys.right = GP.keyboard(39);
	GP.keys.down = GP.keyboard(40);
	
	GP._intervalId = setInterval(GP.run, 0);
}

var lastUpdate = Date.now();
GP.run = (function() {
    var now = Date.now();
    var dt = now - lastUpdate;
	lastUpdate = Date.now();

    GP.entityWorld.update(dt);
	GP.camera.update(dt);
	GP.renderer.render(GP.camera);
});

GP.sendUpdatePacket = function sendUpdatePacket() {
	var physics = GP.player.getComponent('physics');
	var player = GP.player.getComponent('player');
	GP.connection.send('playerupdate', { 
		name: player.username,
		x: physics.x,
		y: physics.y,
		vx: physics.vx,
		vy: physics.vy,
		rotation: physics.rotation
	});
}

GP.spawnPlayer = function spawnPlayer(name) {
	var sprite = new PIXI.Sprite(GP.textures.worker);
	sprite.anchor.x = 0.5;
	sprite.anchor.y = 0.5;
	sprite.position.x = Math.random() * GP.tileMap.width * GP.tileSize;
	sprite.position.y = Math.random() * GP.tileMap.height * GP.tileSize;	
	var text = new PIXI.Text(name, { fill: '#ffffff' });
	
	var player = new CES.Entity();
	player.addComponent(new ECS.Components.Player(name, sprite, text));
	player.addComponent(new ECS.Components.Physics(sprite.position.x, sprite.position.y, 0, 0, 0));
	GP.entityWorld.addEntity(player);
	GP.stage.addChild(sprite);
	GP.stage.addChild(text);
	GP.players[name] = player;
	return player;
}

GP.spawnMainPlayer = function spawnMainPlayer() {
	GP.connection.send('playerinit', { 
		name: "player username that will be selected when accounts exist"
	});
}

GP.despawnPlayer = function despawnPlayer(name) {
	var player = GP.players[name];
    var player = player.getComponent('player');
	GP.stage.removeChild(player.sprite);
	GP.stage.removeChild(player.text);
	delete(GP.players[name]);
}

GP.preload();
GP.create();
