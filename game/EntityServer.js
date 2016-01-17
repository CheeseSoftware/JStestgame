
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
				var control = entity.getComponent('control');
				
				physics.x = data.x;
				physics.y = data.y;
				physics.vx = data.vx;
				physics.vy = data.vy;
				
				control.moveDir = [data.dx, data.dy];
				physics.rotation = data.rotation;
				
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
				
				console.log("update  x:" + physics.x + "  y:" + physics.y);
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
	console.log("Mapped entity. entityId:" + entity.id + " UUID:" + uuid);
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
		var control = entity.getComponent('control');

		var data = {
			uuid: uuid,
			x: physics.x,
			y: physics.y,
			vx: physics.vx,
			vy: physics.vy,
			dx: control.moveDir[0], 
			dy: control.moveDir[1],
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

EntityServer.prototype.sendEntitySpawnPacket = function(entity, socket) {
	var physics = entity.getComponent('physics');
	var control = entity.getComponent('control');
	var data = {
		uuid: entity.uuid,
		type: entity.type,
		x: physics.x,
		y: physics.y,
		vx: physics.vx,
		vy: physics.vy,
		dx: control.moveDir[0],
		dy: control.moveDir[1],
		rotation: physics.rotation
	};
	
	if(socket)
		socket.emit('entityspawn', data);
	else
		this._io.sockets.emit('entityspawn', data);
}

EntityServer.prototype.spawnCreature = function(type) {
	var creature = entityTemplates[type]();
	var health = creature.getComponent("health");
	health.subscribeFunc("onDeath", function(health) {
		//To-do: fix respawn position
		//var physics = creature.getComponent("physics");
		//physics.setAbsolutePosition(0, 0);
		this.removeEntity(creature.uuid);
		this.killCreature(creature.uuid);
	}.bind(this));
	return creature;
}

EntityServer.prototype.killCreature = function(uuid) {
	this._io.sockets.emit("entitydeath", { uuid: uuid });
}


