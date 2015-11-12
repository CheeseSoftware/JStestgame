
ECS.Systems.AnimationSystem = CES.System.extend({
    update: function (dt) {
		//console.log("start animation");
        var entities = this.world.getEntities('animation');
		var now = new Date();
 
        entities.forEach(function (entity) {
			var animComp = entity.getComponent('animation');
			for(var animation in animComp.animations) {
				animation = animComp.animations[animation];
				//console.log("found animation");
				//TODO: Sort animations by priority to allow multiple animations per sprite
				if(animation.animating) {
					console.log("nice animation");
					if(now - animation.lastFrame > animation.mspf) {	
						console.log("found animation to animate");				
						animation.currentFrame += 1;
						if(animation.currentFrame >= animation.animInstance.numFrames)
							animation.currentFrame = 0;
						animComp.sprite.texture.frame = animation.animInstance.frames[animation.currentFrame];
						animation.lastFrame = new Date();
						console.log("changed frame");
					}
				}
			}
            /*if(animComp.isAnimating() && animComp.isTimeForNextFrame()) {
				var next = animComp.nextFrame();
				animComp.sprite.texture = next;
			}		*/
        });
    }
});