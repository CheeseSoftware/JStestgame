ChunkClient = function(chunkManager, connection) {

	this._chunkManager = chunkManager;
	this._generator = new Generator();
	this._connection = connection;

	connection.on("chunk", function(data) {
		//_chunkManager.loadChunk(x, y, tileData, densityData);
		onMessageGetChunk(data.x, data.y, data.tileData, data.densityData);
	});

	return this;
}

ChunkClient.prototype.update = function(camera) {
	var x1 = Math.floor(camera.pos.x/32.0/30.0)-2;
	var y1 = Math.floor(camera.pos.y/32.0/30.0)-2;
	var x2 = Math.ceil((camera.pos.x+camera.width)/32.0/30.0)+2;
	var y2 = Math.ceil((camera.pos.y+camera.width)/32.0/30.0)+2;
	
	// Create/Load chunks:
	for (var y = y1; y <= y2; ++y) {
		for (var x = x1; x <= x2; ++x) {
			var chunk = this._chunkManager.getChunk(x, y);
			if (chunk)
				continue;
			
			// Request Chunk (and create a temporary chunk)
			var chunk = this._chunkManager.createChunk(x, y);
			this._connection.send("getChunk", {x:x, y:y});
		}
	}
}

ChunkClient.prototype.onMessageChunk = function(x, y, tileData, densityData) {
	chunk = this._chunkManager.getChunk(x, y);
	if (!chunk)
		chunk = this._chunkManager.createChunk(x, y);

	chunk.tileData = tileData;
	chunk.densityData = densityData;
}