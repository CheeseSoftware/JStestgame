ChunkServer = function(chunkManager, io) {

	this._chunkManager = chunkManager;
	this._generator = new Generator();

	io.on('connection', (function(socket) {
		chunk = chunkManager.getChunk(0, 0);
		socket.on('getChunk', (function(data) {
			//that.onMessageGetChunk(socket, data.x, data.y);
			chunk = chunkManager.getChunk(data.x, data.y);
			if (!chunk) {
				chunk = chunkManager.createChunk(data.x, data.y);
			}

			socket.emit("chunk", {x:data.x, y:data.y, tileData:chunk.tileData, densityData:chunk.densityData});
		}));
	}));

	return this;
}

ChunkServer.prototype.onMessageGetChunk = function(socket, x, y) {
	chunk = this._chunkManager.getChunk(x, y);
	if (!chunk) {
		chunk = this._chunkManager.createChunk();
	}

	socket.emit("chunk", {x:x, y:y, tileData:chunk.tileData, densityData:chunk.densityData});


}

