

Game = function() {
	this.preload();
}

Game.prototype.load = function() {

	this.hud = new Hud();
	this.hud.create();
	
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
	this.canvas = document.getElementById("canvas");
	try {
		this.gl = canvas.getContext("experimental-webgl");
		this.gl.viewportWidth = canvas.width;
      	this.gl.viewportHeight = canvas.height;
	}
	catch(e) {}
	
	if (!this.gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
	this.gl = null;
	}
	
	
	/*function throwOnGLError(err, funcName, args) {
	  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
	};
	
	this.gl = WebGLDebugUtils.makeDebugContext(this.gl, throwOnGLError);*/
	
	/*function logGLCall(functionName, args) {   
	   console.log("gl." + functionName + "(" + WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
	} 
	
	this.gl = WebGLDebugUtils.makeDebugContext(this.gl, undefined, logGLCall);*/
	
	//this.new_camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	//this.new_renderer = new THREE.WebGLRenderer( { canvas: this.canvas } );
	//this.renderer.clearBeforeRender = false;
	//document.body.appendChild(this.renderer.view);
	
	// Initialize stage, camera, entityWorld
	this.stage = new PIXI.Container();
	
	this.camera = new Camera();	
	this.camera.zoom = 1.0;
	
	// Initialize chunkManager and chunkRenderer
	this.chunkManager = new ChunkManager();
	this.chunkRenderer = new ChunkRenderer(this.gl, this.chunkManager, 32, 32, 32, 32);	
	var floatTextures = this.gl.getExtension('OES_texture_float');
	if (!floatTextures) {
		alert('no floating point texture support');
	}
	
	// Initialize entityWorld and add entity component systems
	this.entityWorld = new CES.World();
	this.entityWorld.addSystem(new ECS.Systems.MovementSystem());
	this.entityWorld.addSystem(new ECS.Systems.InterpolationSystem());
	this.entityWorld.addSystem(new ECS.Systems.TerrainPhysicsSystem(this.chunkManager));
	this.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	this.entityWorld.addSystem(new ECS.Systems.AnimationSystem());
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	//this.entityWorld.addSystem(new ECS.Systems.AISystem());
	
	// Initialize BattleManagger
	this.battleManagger = new BattleManager(this.entityWorld);

	// Initialize animationManager
	this.animationManager = new AnimationManager();
	this.animationManager.load(this.textureManager);
	
	// Initialize physicsWorld
	this.physicsWorld = new PhysicsWorld(); // Args: gravity, sleep
	
	this.lastUpdate = window.performance.now();
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
	//this.renderer.resize(window.innerWidth, window.innerHeight);
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

start = new Date();
Game.prototype.run = function() {
    var now = window.performance.now();
    var dt = (now - this.lastUpdate);
	this.lastUpdate = window.performance.now();
	
	this.physicsWorld.update(dt/1000.0);
	
	this.entityWorld.update(dt);
	
	this.camera.update(dt);
	
	if(this.chunkClient)
		this.chunkClient.update(this.camera);
	
	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	this.gl.clearColor(0.0, 0.1, 0.1, 1.0);
	
	var viewMatrix = mat3.create();
	mat3.identity(viewMatrix);
	
	var projection4 = mat4.create();
	mat4.ortho(projection4, 0, this.gl.viewportWidth, this.gl.viewportHeight, 0);
	var projection = mat3.create();
	mat3.fromMat4(projection, projection4);
	

	/*var scaleasdf = 0.1;
	var scale = vec2.create();
	vec2.set(scale, scaleasdf, scaleasdf);
	mat3.scale(viewMatrix, viewMatrix, scale);*/
	
	var translation = vec3.create();
	vec3.set(translation, this.camera.pos.x, this.camera.pos.y, 1.0);
	mat3.translate(viewMatrix, viewMatrix, translation);	
	
		var viewProjectionMatrix = mat3.create();
	mat3.multiply(viewProjectionMatrix, projection, viewMatrix);

	this.chunkRenderer.render(this.gl, this.chunkManager, viewProjectionMatrix, this.camera);
};

Game.prototype.sendUpdatePacket = function() {
	//TODO: Split playerupdate and entityupdate
	var entities = this.entityWorld.getEntities('controlled', 'physics', 'player');
	entities.forEach(function (entity) {
		var control = entity.getComponent('control');
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
			isDigging: control.isUsingTool
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
		if(drawable)
			drawable.remove();
			
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
		
		this.connection.send("init2");
	}.bind(this), this);
	
	this.connection.on('init2', function(data) {
		var uuid = data.follow;
		if(uuid) {
			var entity = this.entityClient.getEntity(uuid);
			var physics = entity.getComponent("physics");
			this.camera.target = physics;
		}
		else {
			this.camera.targetPos = v2.create(data.target.x, data.target.y);
			
			var cameraVelocity = v2.create(2*Math.random()-1, 2*Math.random()-1);
			v2.normalize(cameraVelocity, cameraVelocity);
			v2.multiply(constants.cameraHoverSpeed, cameraVelocity, cameraVelocity);
			this.camera.velocity = cameraVelocity;
		}
	}.bind(this), this);
	
	this.connection.on('error', console.error.bind(console));
	
	this.connection.on('disconnect', function(data){
		location.reload();
		console.log("Disconnected from server, reloaded page.");
	});
	
	this.connection.on('playerjoin', function(data) {
		if(!this.entityClient.getEntity(data.uuid)) {
			console.log(data.username + " has connected.");
			var player = entityTemplates.player(data.username, data.uuid);
			
			var physics = player.getComponent("physics");
			var control = player.getComponent('control');
			
			physics.x = data.x;
			physics.y = data.y;
			physics.vx = data.vx;
			physics.vy = data.vy;
			
			physics.ix = data.x;
			physics.iy = data.y;
			physics.ivx = data.vx;
			physics.ivy = data.vy;
			
			control.moveDir = [data.dx, data.dy];
			physics.rotation = data.rotation;
			
			physics.oldX = data.x;
			physics.oldY = data.x;
			console.log(JSON.stringify(data));
		}
	}.bind(this), this);
	
	this.connection.on('playerinit', function(data) {
		
		$('#playMenuContainer').fadeOut(300);
        $('#loginPopup').fadeOut(300);
		
		var player = entityTemplates.player(data.username, data.uuid);
		player.addComponent(new ECS.Components.Controlled());
		
		var physics = player.getComponent('physics');
		
		physics.x = data.x;
		physics.y = data.y;
		physics.ix = data.x;
		physics.iy = data.y;
		
		physics.oldX = data.x;
		physics.oldY = data.y;

		physics.rotation = data.rotation;
		
		this.camera.target = physics;
		//console.log(physics.cameraPos);
		this.camera.velocity = null;
		// Bind hud to player
		this.hud.initPlayer(player);
	}.bind(this));
	
	this.connection.on('playerleave', function(data) {
		console.log(data.username + ' has disconnected.');
		this.despawnEntity(data.uuid);
	}.bind(this));
	
	this.connection.on('playerdeath', function(data) {
		var entity = this.entityClient.getEntity(data.uuid);
		var health = entity.getComponent("health");
		var physics = entity.getComponent('physics');
		health.value = health.max;
		physics.setAbsolutePosition(data.x, data.y);
	}.bind(this));
	
	this.connection.on('entityspawn', function(data) {
		var entity = entityTemplates[data.type](data.uuid);
		var physics = entity.getComponent("physics");
		var control = entity.getComponent('control');
		physics.x = data.x;
		physics.y = data.y;
		physics.ix = data.x;
		physics.iy = data.y;
		physics.vx = data.vx;
		physics.vy = data.vy;
		physics.ivx = data.vx;
		physics.ivy = data.vy;
		control.moveDir = [data.dx, data.dy];
		physics.rotation = data.rotation;
		//console.log("Spawned entity of type " + data.type + ". UUID " + data.uuid);
	}.bind(this));
	
	this.connection.on('entitydeath', function(data) {
		this.despawnEntity(data.uuid);
	}.bind(this));
	
	this.connection.on('entityupdate', function(data) {
		var entity = this.entityClient.getEntity(data.uuid);
		
		if(entity != undefined) {
			var control = entity.getComponent("control");
			var physics = entity.getComponent("physics");
			var interpolation = entity.getComponent("interpolation");
			control.moveDir = [data.dx, data.dy];

			physics.x = data.x;
			physics.y = data.y;
			physics.vx = data.vx;
			physics.vy = data.vy;
			
			physics.rotation = data.rotation;		
			interpolation.interpolationDate = new Date();
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
			var anim = 40 * player.digSpeed;
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
	
	this.connection.on('popupmessage', function(data) {
		showPopup(data.title, data.message);
	});
}