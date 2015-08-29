
var mousex = null;
var mousey = null;

document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);

function onMouseUpdate(e) {
    mousex = e.pageX;
    mousey = e.pageY;
}

GP.players = {};

GP.preload = function preload() {
	GP.phaserGame.load.image('cheese', 'textures/cheese.png');
    GP.phaserGame.load.image('worker', 'textures/worker.png');
}

GP.create = function create() {
	GP.phaserGame.stage.disableVisibilityChange = true; 
	GP.phaserGame.physics.startSystem(Phaser.Physics.ARCADE);
	GP.player = new GP.Player("player" + Math.round(Math.random() * 65536));
	
	GP.connection.send('playerinit', { 
		name: GP.player.name,
		x: GP.player.sprite.x,
		y: GP.player.sprite.y,
		rotation: GP.player.sprite.rotation
	});
}

/*var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;*/
var oldRot = 0;
var oldx = 0;
var oldy = 0;
var oldvx = 0;
var oldvy = 0;
GP.update = function update() {
	oldx = GP.player.sprite.x;
	oldy = GP.player.sprite.y;
	oldvx = GP.player.sprite.body.velocity.x;
	oldvy = GP.player.sprite.body.velocity.y;
	oldRot = Math.round(GP.player.sprite.rotation * 100) / 100;
	
	
	cursors = GP.phaserGame.input.keyboard.createCursorKeys();
    GP.player.sprite.body.velocity.x = 0;
	GP.player.sprite.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        GP.player.sprite.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        GP.player.sprite.body.velocity.x = 150;
    }
    if (cursors.up.isDown)
    {
        GP.player.sprite.body.velocity.y = -150;
    }
    else if (cursors.down.isDown)
    {
        GP.player.sprite.body.velocity.y = 150;
    }

    var angle = Math.atan2(GP.player.sprite.body.y - (mousey - GP.player.sprite.height/2), GP.player.sprite.body.x - (mousex - GP.player.sprite.width/2));
    GP.player.sprite.rotation = angle + Math.PI;
	GP.player.text.position = new Phaser.Point(GP.player.sprite.x - GP.player.text.width/2, GP.player.sprite.y - 50);
	
	Object.keys(GP.players).forEach(function (key) { 
    	var player = GP.players[key]
        player.text.position = new Phaser.Point(player.sprite.x - player.text.width/2, player.sprite.y - 50);
	})
	
	// Check if anything changed, if so, send player update packet
	if(oldx != GP.player.sprite.x 
	|| oldy != GP.player.sprite.y
	|| oldvx != GP.player.sprite.body.velocity.x
	|| oldvy != GP.player.sprite.body.velocity.y
	|| oldRot != Math.round(GP.player.sprite.rotation * 100) / 100) {
		GP.sendUpdatePacket();
	}
}

GP.render = function render() {

}

GP.sendUpdatePacket = function sendUpdatePacket() {
	GP.connection.send('playerupdate', { 
		name: GP.player.name,
		x: GP.player.sprite.x,
		y: GP.player.sprite.y,
		vx: GP.player.sprite.body.velocity.x,
		vy: GP.player.sprite.body.velocity.y,
		rotation: GP.player.sprite.rotation
	});
}

GP.phaserGame = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: GP.preload, create: GP.create, update: GP.update, render: GP.render });

GP.connection = new GP.connection(GP.ip, 3000);