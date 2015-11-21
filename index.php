<html>
<head>
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="lib/bootstrap.min.css">

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

	    var isServer = false;
</script>

<script src="lib/Box2D.js"></script>
<script src="lib/ces-browser.js"></script>
<script src="lib/pixi.js"></script>
<script src="lib/socket.io-1.3.5.js"></script>
<script src="lib/gl-matrix.js"></script>
<script src="lib/perlin.js"></script>
<script src="lib/jquery-2.1.x.js"></script>
<script src="lib/bootstrap.min.js"></script> <!-- For progressbar -->

<script src="temp/DigMiner.js"></script>

<!-- classes -- >
<script src="game/core/v2.js"/></script>
<script src="game/Constants.js"></script>
<script src="game/EntityTemplates.js"></script>
<script src="game/EntityMap.js"></script>
<script src="game/EntityClient.js"></script>
<script src="game/TextureLoader.js"></script>
<script src="game/TextureManager.js"></script>
<script src="game/Animation.js"></script>
<script src="game/AnimationManager.js"></script>
<script src="game/AudioManager.js"></script>
<script src="game/Connection.js"></script>
<script src="game/Keyboard.js"></script>
<script src="game/Camera.js"></script>
<script src="game/core/PagedArray2D.js"></script>
<script src="game/components/Drawable.js"></script>
<script src="game/components/Physics.js"></script>
<script src="game/components/Player.js"></script>
<script src="game/components/Controlled.js"></script>
<script src="game/systems/AnimationSystem.js"></script>
<script src="game/systems/PhysicsSystem.js"></script>
<script src="game/systems/TerrainPhysicsSystem.js"></script>
<script src="game/systems/ControlSystem.js"></script>
<script src="game/Shader.js"/></script>
<script src="game/ShaderProgram.js"/></script>
<script src="game/core/Observable.js"/></script>

<!-- Chunk system - ->
<script src="game/TileType.js"></script>
<script src="game/TileRegister.js"></script>
<script src="game/Generator.js"></script>
<script src="game/Chunk.js"></script>
<script src="game/ChunkManager.js"></script>
<script src="game/ChunkRenderer.js"></script>
<script src="game/ChunkClient.js"></script>
<script src="game/RegeneratorClient.js"></script> -->

<!-- game -->
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

	var game = null;

	finishInclude(function() {
		game = new Game();
	});
	
	function tryRegister(username, email, password) {
		$('#registrationResult').html('<img src="game/textures/loading.gif" loop=infinite>');	
		game.connection.send('register', { 
			username: username,
			email: email,
			password: password
		});
	};
	
	function tryLogin(username, password) {		
	$('#loginResult').html('<img src="game/textures/loading.gif" loop=infinite>');	
		game.connection.send('login', { 
			username: username,
			password: password
		});
	};
</script>
<?php
	include("playMenu.html");
	include("registerFrame.html");
	include("loginFrame.html");
	include("progress.html");
?>
</body>
</html>