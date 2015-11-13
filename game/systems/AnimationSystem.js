
ECS.Systems.AnimationSystem = CES.System.extend({
    update: function (dt) {
		//console.log("start animation");
        var entities = this.world.getEntities('drawable');
		var now = new Date();
 
        entities.forEach(function (entity) {
			var drawable = entity.getComponent('drawable');
			var player = entity.getComponent('player');
			for(var bodypart in drawable.bodyparts) {
				bodypart = drawable.bodyparts[bodypart];
				//console.log("found animation");
				//TODO: Sort animations by priority to allow multiple animations per sprite
				if(bodypart.animating) {
					//console.log("nice animation");
					if(now - bodypart.lastFrame > bodypart.mspf) {	
						//console.log("found animation to animate " + player.text.text);				
						bodypart.currentFrame += 1;
						if(bodypart.currentFrame >= bodypart.animInstance.numFrames)
							bodypart.currentFrame = 0;
						bodypart.sprite.texture.frame = bodypart.animInstance.frames[bodypart.currentFrame];
						//console.log("ms since last frame " + (new Date() - bodypart.lastFrame));
						bodypart.lastFrame = new Date();
						
						if(bodypart.finishing && bodypart.currentFrame == 0) {
							bodypart.animating = false;
							bodypart.finishing = false;
						}
						
						//console.log("frame " + bodypart.currentFrame);
						
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