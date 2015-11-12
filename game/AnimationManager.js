
AnimationManager = function() {
	this.animations = {};
}

AnimationManager.prototype.load = function(textures) {
	this.addAnimation("walk", new Animation("walk", textures.walk, 30, 150, 120));
}

AnimationManager.prototype.addAnimation = function(name, animation) {
	if(name != undefined && animation != undefined) {
		var oldAnimation = this.animations[name];
		if(this.animations[name] == undefined) {
			this.animations[name] = animation;
		}
		else
			console.log("Tried to add already added animation");
	}
	else
		console.log("Tried to add animation/key null");
}

AnimationManager.prototype.getAnimation = function(name) {
	return this.animations[name];
}
