MonsterSpawner = function(chunkManager, entityServer, io) {
	this._chunkManager = chunkManager;
	this._entityServer = entityServer;

	this._chunkManager.subscribe(this);

	var that = this;
	io.on('connection', function(socket) {
		that._socket = socket;
	});


	return this;
};

MonsterSpawner.prototype.onChunkCreate = function(chunkX, chunkY, chunk) {
	if (!this._socket)
		return;


	// Reduce probability...
	if (Math.random() > 0.1)
		return;

	var monsterTypes = [
		{
			monsterType: "worker",
			numMonsters: 2,
		},
	]

	for (var i = 0; i < monsterTypes.length; ++i) {
		var monsterType = monsterTypes[i];

		for (var j = 0; j < monsterType.numMonsters; ++j) {
			var x = 32.0*30.0*(chunkX + Math.random());
			var y = 32.0*30.0*(chunkY + Math.random());

			var entity = this._entityServer.spawnCreature(monsterType.monsterType);
			var physics = entity.getComponent('physics');
			physics.body.data.x = x;
			physics.body.data.y = y;
			physics.body.data.oldX = x;
			physics.body.data.oldY = y;

			this._entityServer.sendEntitySpawnPacket(entity, this._socket);
		}
	}
};