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
			
			echo (", ");
			
			$debug = (isset($_GET["debug"]) ? $_GET["debug"] : 'false');
			if(empty($debug))
				$debug = 'false';
			echo ("debug: " . $debug);
		?>
	};
	
	window.ECS = {
		Components: {},
		Systems: {}
	};		

	var isServer = false;
</script>

<script src="lib/ces-browser.js"></script>
<script src="lib/pixi.js"></script>
<script src="lib/socket.io-1.3.5.js"></script>
<script src="lib/gl-matrix.js"></script>
<script src="lib/perlin.js"></script>
<script src="lib/jquery-2.1.x.js"></script>
<script src="lib/bootstrap.min.js"></script> <!-- For progressbar -->

<?php 
	if ($debug != "true") {
		echo '<script src="temp/DigMiner.js"></script>';
	}
	else {
		include("temp/debugSources.html");
	}
?>

<script>
	var game = new Game();
	
	function tryRegister(username, email, password) {
		$('#registrationResult').html('<img src="game/textures/loading.gif" loop=infinite>');	
		game.connection.send('register', { 
			username: username,
			email: email,
			password: password
		});
	};
	
	function login(username, password) {		
		game.connection.send('login', { 
			username: username,
			password: password
		});
	};
	
	function tryLogin(username, password) {		
		$('#loginResult').html('<img src="game/textures/loading.gif" loop=infinite>');	
		login(username, password);
	};
	
</script>
<?php
	include("playMenu.html");
	include("registerFrame.html");
	include("loginFrame.html");
	include("progress.html");
	include("loginPopup.html");
?>
</body>
</html>