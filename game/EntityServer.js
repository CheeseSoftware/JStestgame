
EntityServer = function(entityWorld, playerServer, io) {
	this._entityWorld = entityWorld;
	this._playerServer = playerServer;
	this._io = io;
	this._entityMap = new EntityMap();
	
	this._io.on('connection', function(socket) {
		socket.on('update', function(data) {
			var uuid = this._playerServer.getPlayer(socket.id).uuid;
			var entity = this.getEntity(uuid);

			if(entity) {
				var physics = entity.getComponent('physics');
				physics.gx = data.x;
				physics.gy = data.y;
				physics.gvx = data.vx;
				physics.gvy = data.vy;
				physics.dx = data.dx;
				physics.dy = data.dy;
				physics.rotation = data.rotation;
				physics.lastUpdate = new Date();
				
				socket.broadcast.emit('entityupdate', {
					uuid: data.uuid,
					x: data.x,
					y: data.y,
					vx: data.vx,
					vy: data.vy,
					dx: data.dx, 
					dy: data.dy,
					rotation: data.rotation
				});
			}
			else
				console.log("on 'update': entity undefined");
		}.bind(this));
	}.bind(this));
}

EntityServer.prototype.createEntity = function(uuid) {
	if(!uuid)
		uuid = generateUUID();
	var entity = new CES.Entity();
	entity.uuid = uuid;
	this._entityMap.map(uuid, entity.id);
	//console.log("Mapped entity. entityId:" + entity.id + " UUID:" + uuid);
	return entity;
}

EntityServer.prototype.getEntity = function(uuid) {
	var entityId = this._entityMap.getEntityId(uuid);
	if(entityId != undefined) {
		return this._entityWorld.getEntity(entityId);
	}
	//else
		//console.log("EntityServer getEntity: entityId undefined.");
	return undefined;
}

EntityServer.prototype.removeEntity = function(uuid) {
	var entityId = this._entityMap.getEntityId(uuid);
	if(entityId != undefined) {
		var entity = this._entityWorld.getEntity(entityId);
		this._entityWorld.removeEntity(entity);
		this._entityMap.remove(uuid);
	}
	//else
		//console.log("EntityServer removeEntity: entityId undefined.");
}

EntityServer.prototype.sendUpdatePacket = function(uuid, socket) {
	var entity = this.getEntity(uuid);
	if(entity) {
		var physics = entity.getComponent('physics');
		//console.log("entityserver " + physics.dx + " " + physics.dy);
		
		var data = {
			uuid: uuid,
			x: physics.gx,
			y: physics.gy,
			vx: physics.gvx,
			vy: physics.gvy,
			dx: physics.dx, 
			dy: physics.dy,
			rotation: physics.rotation
		};
		
		if(socket)
			socket.emit('entityupdate', data);
		else
			this._io.sockets.emit('entityupdate', data);
	}
	//else
		//console.log("EntityServer.sendUpdatePacket: entity undefined");
}

EntityServer.prototype.sendEntitySpawnPacket = function(entity) {
	var physics = entity.getComponent('physics');
	var data = {
		uuid: entity.uuid,
		type: entity.type,
		x: physics.gx,
		y: physics.gy,
		vx: physics.gvx,
		vy: physics.gvy,
		dx: physics.dx, 
		dy: physics.dy,
		rotation: physics.rotation
	};
	
	this._io.sockets.emit('entityspawn', data);
}


