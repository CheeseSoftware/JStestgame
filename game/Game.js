

Game = function() {
	this.preload();
}

Game.prototype.load = function() {
	
	//TODO: Move esc code somewhere else
	keyboard.keys.esc.press = function() {
		if($("#registerFrame").is(":visible")) {
			$("#registerFrame").hide();
			return;
		}
			
		if($("#loginFrame").is(":visible")) {
			$("#loginFrame").hide();
			return;
		}
		
		var menu = document.getElementById('playMenuContainer');
		if(menu.style.display == "none")
			$("#playMenuContainer").fadeIn(400);
		else
			$("#playMenuContainer").fadeOut(100);
	};
	
	//TODO: Move input code somewhere else
	this.mousex = null;
	this.mousey = null;
	document.addEventListener('mousemove', this.onMouseUpdate, false);
	document.addEventListener('mouseenter', this.onMouseUpdate, false);
	
	window.addEventListener('resize', this.resize.bind(this), false);
	
	// Initialize window
	this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0xF00000}, true, false);
	this.renderer.clearBeforeRender = false;
	document.body.appendChild(this.renderer.view);
	
	// Initialize stage, camera, entityWorld
	this.stage = new PIXI.Container();
	
	this.camera = new Camera(this.stage);	
	this.camera.zoom = 1.0;
	
	// Initialize chunkManager and chunkRenderer
	var gl = this.renderer.gl;
	this.chunkManager = new ChunkManager();
	this.chunkRenderer = new ChunkRenderer(gl, this.chunkManager, 32, 32, 32, 32);	
	var floatTextures = gl.getExtension('OES_texture_float');
	if (!floatTextures) {
		alert('no floating point texture support');
	}
	
	// Initialize entityWorld and add entity component systems
	this.entityWorld = new CES.World();
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.TerrainPhysicsSystem(this.chunkManager));
	this.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	this.entityWorld.addSystem(new ECS.Systems.AnimationSystem());
	//this.entityWorld.addSystem(new ECS.Systems.AISystem());
	
	// Initialize BattleManagger
	this.battleManagger = new BattleManager(this.entityWorld);

	// Initialize animationManager
	this.animationManager = new AnimationManager();
	this.animationManager.load(this.textureManager);
	
	// Initialize physicsWorld
	this.physicsWorld = new b2World(new b2Vec2(0, 0), false); // Args: gravity, sleep
	
	//TODO: Fix and move playerContactListener
	var playerContactListener = new Box2D.Dynamics.b2ContactListener;// Contact listener begin: Temporarily disable player-to-player collisions
	playerContactListener.BeginContact = function (contact) {
	  //console.log("begincontact");
	}
	playerContactListener.EndContact = function (contact) {
	  //console.log("endcontact");
	}
	playerContactListener.PostSolve = function (contact, impulse) {
		//console.log("PostSolve");
	}
	playerContactListener.PreSolve = function (contact, oldManifold) {
		//console.log("PreSolve");
		contact.SetEnabled(false);
	}
	this.physicsWorld.SetContactListener(playerContactListener);
	
	this.lastUpdate = Date.now();
	
	this.intervalId = setInterval(function(){game.run()}, constants.clientInterval);
	
	this.connection = new Connection(vars.ip, constants.serverPort);
	
	this.initializeListeners();
	
	// Initialize client systems
	this.entityClient = new EntityClient(this.entityWorld);
	this.chunkClient = new ChunkClient(this.chunkManager, this.connection);
	this.regeneratorClient = new RegeneratorClient(this.chunkManager, this.connection);
	this.battleClient = new BattleClient(this.battleManagger, this.entityWorld, this.entityClient, this.connection);
	
	// If cookies are set, login
	var username = getCookie("username");
	var password = getCookie("password");
	if(username && password) { 
		login(username, password);
		console.log("Sent login details");
	}
}

Game.prototype.onMouseUpdate = function (e) {
	mousex = e.pageX;
	mousey = e.pageY;
}

Game.prototype.resize = function() {
	this.renderer.resize(window.innerWidth, window.innerHeight);
	this.camera.width = window.innerWidth;
	this.camera.height = window.innerHeight;

}

Game.prototype.preload = function() {
	// Load textures and sound and heavy things. Progress shown on progressbar.
	this.textureManager = new TextureManager();
	
	this.textureManager.onProgress(function(name, file, progress) {
		$("#progressbar").css("width", progress + "%");
		$("#progressbar").attr("aria-valuenow", progress);
		$("#progressbar").html(progress + "% - " + file + ".png");
	}.bind(this));
	
	this.textureManager.onComplete(function(textures) {
		this.load(); // Continue loading the game
		
		window.setTimeout ( function() {
			$("#progresscontainer").fadeOut();
			$("#playMenu").show();
		}, 800);
	}.bind(this));
	this.textureManager.load();
}

accumulator = 0;
Game.prototype.run = function() {
    var now = Date.now();
    var dt = (now - this.lastUpdate)/1000.0;
	this.lastUpdate = Date.now();
	
	accumulator += dt;
	while(accumulator >= constants.physicsStep) {
		this.physicsWorld.Step(constants.physicsStep, 10, 10);
		accumulator -= constants.physicsStep;
	}
	
    this.entityWorld.update(dt);
	
	this.camera.update(dt);
	
	if(this.chunkClient)
		this.chunkClient.update(this.camera);
	
	var gl = this.renderer.gl;
	this.renderer.setRenderTarget(this.renderer.renderTarget);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	var projectionMatrix = this.renderer.renderTarget.projectionMatrix.clone();
	var viewMatrix = new PIXI.Matrix();
	viewMatrix = viewMatrix.translate(-this.camera.frustrum.x, -this.camera.frustrum.y);
	this.chunkRenderer.render(gl, this.chunkManager, projectionMatrix.clone().append(viewMatrix), this.camera);

	
	this.renderer.render(this.camera);
	
};

Game.prototype.sendUpdatePacket = function() {
	//TODO: Split playerupdate and entityupdate
	var entities = this.entityWorld.getEntities('controlled', 'physics', 'player');
	entities.forEach(function (entity) {
		var physics = entity.getComponent('physics');
		var player = entity.getComponent('player');
		var direction = keyboard.calculateDirection();
		this.connection.send('update', {
			uuid: entity.uuid, 
			username: player.username,
			x: physics.x,
			y: physics.y,
			vx: physics.vx,
			vy: physics.vy,
			dx: direction.x,
			dy: direction.y,
			rotation: physics.rotation,
			
			isDigging: keyboard.getPlayState().dig
		});
	}.bind(this));
}

Game.prototype.spawnMainPlayer = function() {
	this.connection.send('playerinit', { });
}

Game.prototype.despawnEntity = function(uuid) {
	var entity = this.entityClient.getEntity(uuid);

	if(entity) {
		var drawable = entity.getComponent('drawable');
		if(drawable) {
			drawable.remove(this.stage);
			if(drawable.text)
				this.stage.removeChild(drawable.text);
		}
			
		this.entityClient.removeEntity(uuid);
	}
	else
		console.log("Could not despawn entity " + uuid);
}

Game.prototype.initializeListeners = function() {
	this.connection.on('init', function(data) {
		
		this.tileMap = { 
			width: data.mapWidth,
			height: data.mapHeight,
		};
		
		this.tileSize = data.tileSize;
		
		var uuid = data.follow;
		if(uuid) {
			var entity = this.entityClient.getEntity(uuid);
			var physics = entity.getComponent("physics");
			this.camera.target = physics;
		}
		else {
			this.camera.target = data.target;
			var cameraVelocity = new b2Vec2(2*Math.random()-1, 2*Math.random()-1);
			cameraVelocity.Normalize();
			cameraVelocity.Multiply(constants.cameraHoverSpeed);
			this.camera.velocity = cameraVelocity;
		}
		
		
	}.bind(this), this);
	
	this.connection.on('error', console.error.bind(console));
	
	this.connection.on('message', function(data) {
		console.log(data);
	});
	
	this.connection.on('disconnect', function(data){
		location.reload();
		console.log("Disconnected from server, reloaded page.");
	});
	
	this.connection.on('playerjoin', function(data) {
		if(!this.entityClient.getEntity(data.uuid)) {
			console.log(data.username + " has connected.");
			var player = entityTemplates.player(data.username, data.uuid);
			
			var physics = player.getComponent("physics");
			physics.x = data.x;
			physics.y = data.y;
			physics.gx = data.x;
			physics.gy = data.y;
			physics.gvx = data.vx;
			physics.gvy = data.vy;
			physics.dx = data.dx;
			physics.dy = data.dy;
			physics.rotation = data.rotation;
			
			physics.oldX = data.x;
			physics.oldY = data.x;
		}
	}.bind(this), this);
	
	this.connection.on('playerinit', function(data) {
		var player = entityTemplates.player(data.username, data.uuid);
		player.addComponent(new ECS.Components.Controlled());
		
		var physics = player.getComponent('physics');
		physics.x = data.x;
		physics.y = data.y;
		physics.oldX = data.x;
		physics.oldY = data.y;
		physics.gx = data.x;
		physics.gy = data.y;
		physics.rotation = data.rotation;
		
		this.camera.target = physics;
		this.camera.velocity = null;
	}.bind(this));
	
	this.connection.on('playerleave', function(data) {
		console.log(data.username + ' has disconnected.');
		this.despawnEntity(data.uuid);
	}.bind(this));
	
	this.connection.on('entityspawn', function(data) {
		var entity = entityTemplates[data.type](data.uuid);
		var physics = entity.getComponent("physics");
		physics.gx = data.x;
		physics.gy = data.y;
		physics.x = data.x;
		physics.y = data.y;
		physics.gvx = data.vx;
		physics.gvy = data.vy;
		physics.dx = data.dx;
		physics.dy = data.dy;
		physics.rotation = data.rotation;
		//console.log("Spawned entity of type " + data.type + ". UUID " + data.uuid);
	}.bind(this));
	
	this.connection.on('entityupdate', function(data) {
		var entity = this.entityClient.getEntity(data.uuid);
		
		if(entity != undefined) {
			var physics = entity.getComponent("physics");
			physics.gx = data.x;
			physics.gy = data.y;
			physics.gvx = data.vx;
			physics.gvy = data.vy;
			physics.dx = data.dx;
			physics.dy = data.dy;
			physics.rotation = data.rotation;		
			physics.lastUpdate = new Date();
		}
		else
			console.log("entity is undefined in 'entityupdate' Game.js");
	}.bind(this));
	
	this.connection.on('playerupdate', function(data) {
		var entity = this.entityClient.getEntity(data.uuid);
		
		if(entity != undefined) {
			var player = entity.getComponent("player");
			var physics = entity.getComponent("physics");
			var drawable = entity.getComponent("drawable");
			var anim = 60 * player.digSpeed;
			if(player) {
				player.isDigging = data.isDigging;
				if(data.isDigging) {
					drawable.animate("body", "dig", anim, false);
					physics.acceleration = constants.digAcceleration;
				}
				else if(physics.acceleration != constants.acceleration) {
					drawable.animate("body", "dig", anim, true);
					physics.acceleration = constants.acceleration;
				}
			}
			else
				console.log("playerupdate: entity is not a player");
		}
		else
			console.log("entity is undefined in 'playerupdate' Game.js");
	}.bind(this));
	
	this.connection.on('dig', function(data) {
		var uuid = data.uuid;
		var x = data.x;
		var y = data.y;
		var digRadius = data.digRadius;
		this.chunkManager.fillCircle(parseFloat(x)/32.0, parseFloat(y)/32.0, digRadius);
	}.bind(this));
	
	/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< Register and login below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
	
	this.connection.on('registrationresponse', function(data) {
		$('#registrationResult').html(data.response);
		if(data.success == true) {
			setCookie("username", $('#registerUsername').val(), 31);
			setCookie("password", $('#registerPassword').val(), 31);
		}
	});
	
	this.connection.on('loginresponse', function(data) {
		if($('#loginFrame').is(":visible")) {
			$('#loginResult').html(data.response);
			if(data.success == true) {
				setCookie("username", $('#loginUsernameEmail').val(), 31);
				setCookie("password", $('#loginPassword').val(), 31);
			}
		}
		else if(data.success == true) {
			$("#loginPopup").fadeIn(400);
		}
	});
}