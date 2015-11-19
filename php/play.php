<script type="application/javascript">
		window.vars = { 
			<?php
				$ip = (isset($_GET["ip"]) ? '"' . $_GET["ip"] . '"' : '"107.6.140.41"');
				if(empty($ip))
					$ip = '"107.6.140.41"';
				echo ("ip: " . $ip);
			?>
		};
		
		window.ECS = {
        	Components: {},
			Systems: {}
	    };		
</script>

<script src="lib/Box2D.js"></script>
<script src="lib/ces-browser.js"></script>
<script src="lib/pixi.js"></script>
<script src="lib/socket.io-1.3.5.js"></script>
<script src="lib/gl-matrix.js"></script>
<script src="lib/perlin.js"></script>
<script src="lib/jquery-2.1.x.js"></script>


<!-- classes -->
<script src="game/TextureLoader.js"></script>
<script src="game/TextureManager.js"></script>
<script src="game/Animation.js"></script>
<script src="game/AnimationManager.js"></script>
<script src="game/AudioManager.js"></script>
<script src="game/Connection.js"></script>
<script src="game/Keyboard.js"></script>
<script src="game/Camera.js"></script>
<script src="game/PagedArray2D.js"></script>
<script src="game/components/Drawable.js"></script>
<script src="game/components/Physics.js"></script>
<script src="game/components/Player.js"></script>
<script src="game/components/ControlledPlayer.js"></script>
<script src="game/systems/AnimationSystem.js"></script>
<script src="game/systems/PhysicsSystem.js"></script>
<script src="game/systems/TerrainPhysicsSystem.js"></script>
<script src="game/systems/ControlSystem.js"></script>
<script src="game/Shader.js"/></script>
<script src="game/ShaderProgram.js"/></script>
<script src="game/Observable.js"/></script>

<!-- Chunk system -->
<script src="game/TileType.js"></script>
<script src="game/TileRegister.js"></script>
<script src="game/Generator.js"></script>
<script src="game/Chunk.js"></script>
<script src="game/ChunkManager.js"></script>
<script src="game/ChunkRenderer.js"></script>
<script src="game/ChunkClient.js"></script>

<!-- game -->
<script src="game/Game.js"></script>
<script>
	var   b2Vec2 = Box2D.Common.Math.b2Vec2
	,  b2AABB = Box2D.Collision.b2AABB
	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
	,	b2Body = Box2D.Dynamics.b2Body
	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
	,	b2Fixture = Box2D.Dynamics.b2Fixture
	,	b2World = Box2D.Dynamics.b2World
	,	b2MassData = Box2D.Collision.Shapes.b2MassData
	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
	,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
	;
	
	var game = new Game();
	
	function tryRegister(username, email, password) {		
		game.connection.send('register', { 
			username: username,
			email: email,
			password: password
		});
	};
	/*
	game.connection.on('registerresponse', function(data) {
		$('#registrationResult').html(data.response);
		if(data.success == true) {
			
			var d = new Date();
			d.setTime(d.getTime() + (14*24*60*60*1000));
			var expires = "expires="+d.toUTCString();
			document.cookie="username=" + $('#registerUsername').val() + "; " + expires;
			document.cookie="password=" + $('#registerPassword').val() + "; " + expires;
		}
	});*///TEMP
</script>

<div class = "playMenu" id = "playMenu">
	<img src="game/textures/logo.png" /></img><br/><br/>
	<div id="playButton" class = "button" onclick = "document.getElementById('playMenu').style.display = 'none'; game.spawnMainPlayer(); document.getElementById('playButton').onclick = undefined;">
		<p>Play!</p>
	</div>
	<a class = "button" onclick="document.getElementById('registerFrame').style.display = 'block';">
		<p>Register</p>
	</a>
    <a class = "button" onclick="document.getElementById('loginFrame').style.display = 'block';">
		<p>Login</p>
	</a>
</div>

<div id="registerFrame" class="registerFrame">
	<div class="closeWindowButton" onclick="document.getElementById('registerFrame').style.display = 'none'"></div>
    <div class="innerRegisterFrame">
        Username:<br>
        <input type="text" id="registerUsername" value=""> 
        <br>Email:<br>
        <input type="text" id="registerEmail" value="">
        <br>Password:<br>
        <input type="text" id="registerPassword" value="">
        <br />
        <div class="registerButton" onclick="tryRegister($('#registerUsername').val(), $('#registerEmail').val(), $('#registerPassword').val()); $('#registrationResult').html('Waiting for registration response..');"><p>Register</p></div>
    	<p id="registrationResult"></p>
    </div>
</div>

<div id="loginFrame" class="loginFrame">
	<button class="loginFrameHideButton" type="button" onclick="document.getElementById('loginFrame').style.display = 'none'"> Hide </button>
    
</div>