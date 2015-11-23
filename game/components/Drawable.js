
ECS.Components.Drawable = CES.Component.extend({
    name: 'drawable',
	// sprites is hashmap with key/value=name/sprite, ex. "feet"/feetsprite
    init: function (bodyparts, animationManager, offsetX, offsetY) {
		this.bodyparts = bodyparts; // sprite {}
		this.offsetX = offsetX;
		this.offsetY = offsetY;	
		this.animationManager = animationManager;
    }
});

ECS.Components.Drawable.prototype.animate = function(bodypartName, animation, fps, runToEnd) {
	//console.log(bodypartName);
	var bodypart = this.bodyparts[bodypartName];
	if(bodypart) {
		if(!bodypart.animInstance) {
			bodypart.animInstance = this.animationManager.getAnimation(animation);
			bodypart.sprite.texture = bodypart.animInstance.texture.clone();
		}
		bodypart.mspf = 1000.0/fps;
		if(!bodypart.lastFrame)
			bodypart.lastFrame = new Date();
		if(!bodypart.currentFrame)
			bodypart.currentFrame = 0;
		bodypart.runToEnd = runToEnd; //If animation is aborted, finish animation and stop at frame 0
		bodypart.finishing = false;
		bodypart.animating = true;
	}
}

ECS.Components.Drawable.prototype.unanimate = function(bodypart, animation) {
	var bodypart = this.bodyparts[bodypart];
	if(bodypart) {
		if(bodypart.runToEnd && bodypart.currentFrame != 0) {
			bodypart.finishing = true;
		}
		else {
			bodypart.currentFrame = 0;
			bodypart.animating = false;	
		}
	}
}

ECS.Components.Drawable.prototype.positionAll = function(x, y, rotation) {
	for(var bodypart in this.bodyparts) {
		bodypart = this.bodyparts[bodypart];
		bodypart.sprite.position.x = x;
		bodypart.sprite.position.y = y;
		bodypart.sprite.rotation = rotation;
	}
}

ECS.Components.Drawable.prototype.remove = function(stage) {
	for(var bodypart in this.bodyparts) {
		bodypart = this.bodyparts[bodypart];
		stage.removeChild(bodypart.sprite);
	}
}