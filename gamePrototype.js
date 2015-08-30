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
	GP.camera.viewport.width = window.innerWidth;
	GP.camera.viewport.height = window.innerHeight;

}

GP.players = {};

GP.preload = function preload() {
	GP.textures = {};
	GP.textures.cheese = PIXI.Texture.fromImage('textures/cheese.png');
	GP.textures.worker = PIXI.Texture.fromImage('textures/worker.png');
}

GP.create = function create() {
	// Initialize tilemap
	for(var x = 0; x < GP.tileMap.width; ++x) {	
		GP.tileMap[x] = [];		
		for(var y = 0; y < GP.tileMap.height; ++y) {
			var sprite = new PIXI.Sprite(GP.textures.cheese);
			sprite.position.x = x * GP.tileSize;
			sprite.position.y = y * GP.tileSize;
			GP.stage.addChild(sprite);
			GP.tileMap[x][y] = { sprite: sprite, health: 100};
		}
	}
	
	
	GP.entityWorld = new CES.World();
	// Add more systems here!
	
	GP.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	GP.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	
	GP.keys = {};
	GP.keys.left = GP.keyboard(37);
	GP.keys.up = GP.keyboard(38);
	GP.keys.right = GP.keyboard(39);
	GP.keys.down = GP.keyboard(40);

	GP.player = GP.spawnPlayer("player" + Math.round(Math.random() * 65536));
	GP.player.addComponent(new ECS.Components.ControlledPlayer());

	var player = GP.player.getComponent('player');
	var physics = GP.player.getComponent('physics');
	console.log(player.username);
	
	GP.connection.send('playerinit', { 
		name: player.username,
		x: physics.x,
		y: physics.y,
		rotation: physics.rotation
	});
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
	sprite.position.x = 132;
	sprite.position.y = 132;	
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

GP.despawnPlayer = function despawnPlayer(name) {
	var player = GP.players[name];
    var player = player.getComponent('player');
	GP.stage.removeChild(player.sprite);
	GP.stage.removeChild(player.text);
	delete(GP.players[name]);
}

GP.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0x000000}, true, false);
document.body.appendChild(GP.renderer.view);
GP.stage = new PIXI.Container();
GP.camera = new Camera(GP.stage);
GP.connection = new GP.connection(GP.ip, 3000);
GP.camera.zoom = 1.0;

GP.tileMap = { 
	width: 32,
	height: 32,
	tiles: []
};

GP.tileSize = 64;

GP.preload();
GP.create();
GP._intervalId = setInterval(GP.run, 0);
