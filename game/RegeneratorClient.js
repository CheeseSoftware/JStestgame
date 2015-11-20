RegeneratorClient = function(chunkManager, connection) {

	this._chunkManager = chunkManager
	this._connection = connection;

	var that = this;
	connection.on("regenerate", function(data) {
		//_chunkManager.loadChunk(x, y, tileData, densityData);
		that.onMessageRegenerate(data.regenerateAmount, data.regeneratedTiles);
	});

	return this;
}

RegeneratorClient.prototype.onMessageRegenerate = function(regenerateAmount, regeneratedTiles) {
	for (i = 0; i < regeneratedTiles.length; ++i) {
		tilePos = regeneratedTiles[i];
		density = this._chunkManager.getDensity(tilePos.x, tilePos.y);
		newDensity = Math.min(density+regenerateAmount, 255);
		this._chunkManager.setDensity(tilePos.x, tilePos.y, newDensity);
	}
}