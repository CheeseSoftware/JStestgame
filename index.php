<html>
<head>
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="lib/bootstrap.min.css">
</head>

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