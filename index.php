<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Namnlöst dokument</title>
    <script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
    
    <style type="text/css">
		html {
			overflow:hidden;
		}
		
		body { 
		    margin: 0; 
		    padding: 0
		}
	</style>
</head>

<body>
	<script type="application/javascript">
		window.GP = { 
			<?php
				$ip = (isset($_GET["ip"]) ? '"' . $_GET["ip"] . '"' : '"127.0.0.1"');
				if(empty($ip))
					$ip = '"127.0.0.1"';
				echo ("ip: " . $ip);
			?>
		};
		
		window.ECS = {
        	Components: {},
			Systems: {}
	    };
	</script>

	<script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>
	<script src="phaser.js"></script>
    <script src="Player.js"></script>
    <script src="Connection.js"></script>
    <script src="components/PhysicsComponent.js"></script>
    <script src="Entity.js"></script>
    <script src="GamePrototype.js"></script>

</body>
</html>
