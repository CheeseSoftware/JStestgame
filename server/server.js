fs = require('fs');

var include = function( lib ) {
	data = fs.readFileSync("../" + lib, 'utf8');

	console.log(data);
	eval(data);
	
	
}

//Libraries
include("lib/Box2D.js");
include("lib/ces-browser.js");
include("lib/perlin.js");

//Core
include("game/Observable.js");

// Tiles
include("game/TileType.js");
include("game/TileRegister.js");


// Chunks
include("game/chunk.js");
include("game/Generator.js");
include("game/chunkmanager.js");


_chunkManager = new ChunkManager();