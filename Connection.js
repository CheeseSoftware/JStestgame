Connection = function(ip, port){
	var socket = io('http://' + ip + ':' + port);
	this.socket = socket;
	console.log('[Socket.IO]', "Connecting to " + ip + ":" + port);
	socket.on('connect', function() {
		console.log('[Socket.IO]', "Connected: " + socket.connected);
	});

	/*socket.on('init', function(data) {	
		GP.tileMap = { 
			width: data.mapWidth,
			height: data.mapHeight,
			tiles: []
		};
		
		GP.tileSize = data.tileSize;
		
		GP.camera.target.x = GP.tileMap.width * GP.tileSize - GP.camera.viewport.width / 2;
		GP.camera.target.y = GP.tileMap.height * GP.tileSize - GP.camera.viewport.height / 2;
		
		// Draw map ground
		/*for(var x = 0; x < GP.tileMap.width; ++x) {	
			for(var y = 0; y < GP.tileMap.height; ++y) {
				if(x * GP.tileSize % 1024 == 0 && y * GP.tileSize % 1024 == 0) {
					var sprite = new PIXI.Sprite(GP.textures.ground);
					sprite.position.x = x * GP.tileSize;
					sprite.position.y = y * GP.tileSize;
					GP.stage.addChild(sprite);
				}
			}
		}* /
		
		// Draw map border
		for(var x = -1024; x <= GP.tileMap.width * GP.tileSize; ++x) {	
			for(var y = -1024; y <= GP.tileMap.height * GP.tileSize; ++y) {
				if(x == -1024 || x == GP.tileMap.width * GP.tileSize || y == -1024 || y ==  GP.tileMap.height * GP.tileSize) {
					if(x % 1024 == 0 && y % 1024 == 0) {
						var sprite = new PIXI.Sprite(GP.textures.block);
						sprite.position.x = x;
						sprite.position.y = y;
						GP.stage.addChild(sprite);
					}
				}
			}
		}
	});*/
	
	socket.on('error', console.error.bind(console));
	//socket.on('message', console.log.bind(console));
	
	socket.on('message', function(data) {
		console.log(data);
	});
	
	socket.on('playerjoin', function(data) {
		/*console.log(data.name + " has connected.");
		var player = GP.spawnPlayer(data.name);
		var physics = player.getComponent("physics");
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;
		GP.players[data.name] = player;*/
	});
	
	socket.on('playerinit', function(data) {
		/*GP.player = GP.spawnPlayer(data.name);
		GP.player.addComponent(new ECS.Components.ControlledPlayer());
	
		var player = GP.player.getComponent('player');
		var physics = GP.player.getComponent('physics');
		physics.x = data.x;
		physics.y = data.y;
		physics.rotation = data.rotation;*/
	});
	
	socket.on('playerupdate', function(data) {
		/*var player = GP.players[data.name];
		if(player != undefined) {
			var physics = player.getComponent("physics");
			physics.x = data.x;
			physics.y = data.y;
			physics.vx = data.vx;
			physics.vy = data.vy;
			physics.rotation = data.rotation;
		}
		else
			console.log("undefined");*/
	});
	
	socket.on('playerleave', function(data) {
		console.log(data.name + ' has disconnected.');
		//GP.despawnPlayer(data.name);
	});
	
	socket.on('chatmessage', function(data) {
		addChat(data.message);
	});
	
    return this;
};

Connection.prototype.send = function send(type, msg) {
	this.socket.emit(type, msg);
};