
ECS.Components.Animation = CES.Component.extend({
    name: 'animation',
    init: function (sprite, animationManager) {
        this.sprite = sprite;
		this.animationManager = animationManager;
		this.animations = {};
    }
});

ECS.Components.Animation.prototype.animate = function(animation, fps) {
	this.animations[animation] = {};
	this.animations[animation].animInstance = this.animationManager.getAnimation(animation);
	this.animations[animation].mspf = 1000/fps;
	this.animations[animation].lastFrame = new Date();
	this.animations[animation].currentFrame = 0;
	this.animations[animation].animating = true;
}

ECS.Components.Animation.prototype.unanimate = function(animation) {
	//delete this.animations[animation];
	if(this.animations[animation])
		this.animations[animation].animating = false;
}