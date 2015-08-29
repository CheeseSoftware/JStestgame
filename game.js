
var systems = [
	ECS.Systems.RenderSystem
];

window.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, draw: draw });

function preload() {
	game.load.image('cheese', 'textures/cheese.png');
}

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
    player = game.add.sprite(132, 132, 'cheese');
	game.physics.arcade.enable(player);

    //player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
	
	//Create entities
	var entities = {};
    for(var i=0; i < 20; i++){
        entity = new ECS.Entity();
		var params = {x:Math.random()*512, y:Math.random()*512};
        entity.addComponent( new ECS.Components.Physics(params));
		var params = {width:64, height:64, imgsrc:"cheese.png"};
		entity.addComponent( new ECS.Components.Texture(params));
        //entity.addComponent( new ECS.Components.Collision());
        entities[entity.id] = entity;
    }
	ECS.entities = entities;
}

function update() {
	cursors = game.input.keyboard.createCursorKeys();
    player.body.velocity.x = 0;
	player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 150;
    }
    if (cursors.up.isDown)
    {
        player.body.velocity.y = -150;
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 150;
    }

}

function draw() {
	ECS.Systems.RenderSystem(ECS.entities);
}