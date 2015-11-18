ChunkClient = function(chunkManager, connection) {

	this._chunkManager = chunkManager;
	this._generator = new Generator();
	this._connection = connection;
	this.requestedChunks = {};

	var context = this;
	connection.on("chunk", function(data) {
		//_chunkManager.loadChunk(x, y, tileData, densityData);
		context.onMessageGetChunk(data.x, data.y, data.tileData, data.densityData);
	});

	return this;
}

ChunkClient.prototype.update = function(camera) {
	var x1 = Math.floor(camera.pos.x/32.0/30.0);
	var y1 = Math.floor(camera.pos.y/32.0/30.0);
	var x2 = Math.ceil((camera.pos.x+camera.width)/32.0/30.0);
	var y2 = Math.ceil((camera.pos.y+camera.width)/32.0/30.0);
	
	// Create/Load chunks:
	for (var y = y1; y <= y2; ++y) {
		for (var x = x1; x <= x2; ++x) {
			var chunk = this._chunkManager.getChunk(x, y);
			if (chunk)
				continue;
			
			// Request Chunk (and create a temporary chunk)
			//var chunk = this._chunkManager.createChunk(x, y);
			
			var chunkPosString = x + "," + y;
			if(!this.requestedChunks[chunkPosString]) {
				this.requestedChunks[chunkPosString] = true;
				this._connection.send("getChunk", {x:x, y:y});
				console.log("request chunk x:" + x + " y:" + y);
			}
		}
	}
}

ChunkClient.prototype.onMessageGetChunk = function(x, y, tileData, densityData) {
	var chunk = this._chunkManager.createChunk(x, y, new Uint8Array(tileData), new Uint8Array(densityData), true);

	//chunk.tileData = new Uint8Array(tileData);
	//chunk.densityData = new Uint8Array(densityData);
	chunk.isChanged = true;
	
	var chunkPosString = x + "," + y;
	delete this.requestedChunks[chunkPosString];
	
	console.log("got chunk x:" + x + " y:" + y);
}