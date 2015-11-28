ChunkServer = function(chunkManager, io) {

	this._chunkManager = chunkManager;
	this._generator = new Generator();

	var context = this;
	io.on('connection', (function(socket) {
		var chunk = chunkManager.getChunk(0, 0);
		socket.on('getChunk', (function(data) {
			//console.log("getchunk " + data.x + " " + data.y);
			context.onMessageGetChunk(socket, data.x, data.y);
		}));
	}));

	return this;
}

ChunkServer.prototype.onMessageGetChunk = function(socket, x, y) {
	var chunk = this._chunkManager.getChunk(x, y);
	if (!chunk) {
		chunk = this._chunkManager.createChunk(x, y);
	}

	socket.emit("chunk", {x:x, y:y, tileData:chunk.tileData.buffer, densityData:chunk.densityData.buffer});
}

