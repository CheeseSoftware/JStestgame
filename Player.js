
GP.Player = function Player (name){
	
	this.playerSprite = GP.phaserGame.add.sprite(132, 132, 'worker');
	GP.phaserGame.physics.arcade.enable(this.playerSprite);
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.anchor.setTo(0.5, 0.5);
	this.sprite = this.playerSprite;
	delete this.playerSprite;
	this.name = name;
	
	var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
	this.text = GP.phaserGame.add.text(0, 0, name, style);
	
    return this;
};