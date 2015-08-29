
GP.Player = function Player (phaserGame, name){
	
	this.playerSprite = phaserGame.add.sprite(132, 132, 'worker');
	phaserGame.physics.arcade.enable(this.playerSprite);
    this.playerSprite.body.collideWorldBounds = true;
    this.playerSprite.anchor.setTo(0.5, 0.5);
	this.sprite = this.playerSprite;
	delete this.playerSprite;
	
	var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
	this.text = phaserGame.add.text(0, 0, name, style);
	
    return this;
};