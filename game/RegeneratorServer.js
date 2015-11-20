RegeneratorServer = function(chunkManager, io) {

	this._chunkManager = chunkManager;
	this._io = io;
	this._collapsingTiles = {};
	this._tilesCount = 0;

	this._regeneratedTiles = [];
	this._lastSync = Date();

	//
	this._wastedDeltaTime = 0.0;

	// Constants
	this._regenerateAmount = 65;

	chunkManager.subscribe(this);


	return this;
}

RegeneratorServer.prototype.update = function(deltaTime) {

	keys = Object.keys(this._collapsingTiles);

	// Time for each tile to regenerate. (seconds)
	regenerateTime = 60.0;

	// Calculate the amount of tiles to regenerate.
	temp = keys.length * (deltaTime) / regenerateTime + this._wastedDeltaTime;
	tilesToRegenerate = Math.floor(temp);
	this._wastedDeltaTime = temp - tilesToRegenerate;

	// Return when there isn't anything to do!
	if (keys.length == 0)
		return;
	
	// Regenerate tiles:
	for (i = 0; i < tilesToRegenerate; ++i) {
		index = Math.floor(keys.length * Math.random());
		key = keys[index];
		tilePos = this._collapsingTiles[key];
		
		density = this._chunkManager.getDensity(tilePos.x, tilePos.y);
		newDensity = Math.min(density+this._regenerateAmount, 255);
		this._chunkManager.setDensity(tilePos.x, tilePos.y, newDensity);
		this._regeneratedTiles.push(tilePos);

		if (newDensity == 255) {
			delete this._collapsingTiles[keys[index]];
			keys.splice(index, 1);
			this._tilesCount--;

			this.notifyTile(tilePos.x, tilePos.y+1);
			this.notifyTile(tilePos.x, tilePos.y-1);
			this.notifyTile(tilePos.x+1, tilePos.y);
			this.notifyTile(tilePos.x-1, tilePos.y);

			if (keys.length == 0)
				break;
		}
	}

	if (((new Date()) - this._lastSync) >= 500 && this._socket != null) {
		this._lastSync = new Date();

		this._io.sockets.emit("regenerate", {regenerateAmount : this._regenerateAmount, regeneratedTiles : this._regeneratedTiles});

		this._regeneratedTiles = [];
	}

}

RegeneratorServer.prototype.onDensityChange = function(tileX, tileY, newDensity) {
	if (newDensity == 255)
		return;

	this.notifyTile(tileX, tileY);

	if (newDensity < 128) {
		this.notifyTile2(tileX, tileY+1);
		this.notifyTile2(tileX, tileY-1);
		this.notifyTile2(tileX+1, tileY);
		this.notifyTile2(tileX-1, tileY);
	}
}

// Check whetever a tile should collapse
RegeneratorServer.prototype.notifyTile = function(tileX, tileY) {
	density = this._chunkManager.getDensity(tileX, tileY);

	if (density == 255)
		return;

	keyToString = tileX + "," + tileY;

	if (this._collapsingTiles.hasOwnProperty(keyToString))
		return;

	this._collapsingTiles[keyToString] = {x:tileX, y:tileY};
	this._tilesCount++;
}

// Checks whetever a tile should stop collapsing
RegeneratorServer.prototype.notifyTile2 = function(tileX, tileY) {
	density = this._chunkManager.getDensity(tileX, tileY);

	if (density == 255)
		return;

	keyToString = tileX + "," + tileY;

	if (!this._collapsingTiles.hasOwnProperty(keyToString))
		return;

	minDensity =  0;
	minDensity = Math.max(minDensity, this._chunkManager.getDensity(tileX, tileY+1));
	minDensity = Math.max(minDensity, this._chunkManager.getDensity(tileX, tileY-1));
	minDensity = Math.max(minDensity, this._chunkManager.getDensity(tileX+1, tileY));
	minDensity = Math.max(minDensity, this._chunkManager.getDensity(tileX-1, tileY));

	if (minDensity >= 128)
		return;

	delete this._collapsingTiles[keyToString];
	this._tilesCount--;
}