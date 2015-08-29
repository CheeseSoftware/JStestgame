
var systems = [
	ECS.Systems.RenderSystem
];

var mousex = null;
var mousey = null;

document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mouseenter', onMouseUpdate, false);

function onMouseUpdate(e) {
    mousex = e.pageX;
    mousey = e.pageY;
}

GP.preload = function preload() {
	GP.phaserGame.load.image('cheese', 'textures/cheese.png');
    GP.phaserGame.load.image('worker', 'textures/worker.png');
}

GP.create = function create() {
	GP.phaserGame.physics.startSystem(Phaser.Physics.ARCADE);
	GP.player = new GP.Player(GP.phaserGame, "player");
}

GP.update = function update() {
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
	
    GP.phaserGame.debug.spriteInfo(GP.player.sprite, 32, 32);
}

GP.render = function render() {
	ECS.Systems.RenderSystem(ECS.entities);
}

GP.phaserGame = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: GP.preload, create: GP.create, update: GP.update, render: GP.render });