
TextureManager = function() {
	this.loader = new TextureLoader();
	this.loader.queueTexture("gubbe");
	this.loader.queueTexture("cheese");
	this.loader.queueTexture("worker");
	this.loader.queueTexture("ground");
	this.loader.queueTexture("block");
	this.loader.queueTexture("rock");
	this.loader.queueTexture("healthbar");
	this.loader.queueTexture("largerock", "rock_large");
	this.loader.queueTexture("feet", "feetSheet");
	this.loader.queueTexture("dig", "digSheet");
	
	console.log("Loading textures...");
	
	this.loader.onProgress(function(name, file, progress) {
		console.log(progress + "% complete");
		if(context.onProgressFunc)
			context.onProgressFunc(name, file, progress);
	});
	
	var context = this;
	this.loader.onComplete(function(textures) {
		context.textures = textures;
		if(context.onCompleteFunc)
			context.onCompleteFunc(textures);
	});
}

TextureManager.prototype.load = function() {
	this.loader.loadTextures();
}

TextureManager.prototype.onComplete = function(func) {
	this.onCompleteFunc = func;
}

TextureManager.prototype.onProgress = function(func) {
	this.onProgressFunc = func;
}