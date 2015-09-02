<script type="application/javascript">
		window.vars = { 
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


<!-- libraries -->
<!--<script src="jquery-2.1.x.js"></script>-->
<script src="game/ces-browser.js"></script>
<script src="game/pixi.js"></script>
<script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>

<!-- classes -->
<script src="game/Connection.js"></script>
<script src="game/Keyboard.js"></script>
<script src="game/Camera.js"></script>
<script src="game/PagedArray2D.js"></script>
<script src="game/components/Physics.js"></script>
<script src="game/components/Player.js"></script>
<script src="game/components/ControlledPlayer.js"></script>
<script src="game/systems/PhysicsSystem.js"></script>
<script src="game/systems/ControlSystem.js"></script>

<!-- game -->
<script src="game/Game.js"></script>
<script>
	var game = new Game();
</script>

<div class = "playMenu" id = "playMenu">
	<img src="../textures/logo.png" /></img><br/><br/>
	<div class = "button" onclick = "$('#playMenu').remove(); game.spawnMainPlayer();">
		<p>Play!</p>
	</div>
	<a class = "button" href = "phptest.php?action=hello">
		<p>Something!</p>
	</a>
	<a class = "button" href = "phptest.php?action=error404">
		<p>Something else!</p>
	</a>
	<?php include("php/quotes.php"); ?>
</div>

<!--<div class="chatBox">
	<div id="chatTextContainer" name="chatTextContainer" class="chatTextContainer"></div>
    <input type="text" name="chatInput" class="chatInput" name="bertil"></input>
    <button class ="chatButton" type="button" name="chatButton" onclick="sendChat()">Send</button>
</div>

<script>
	sendChat = function(){
		var chatText = document.getElementsByName('chatTextContainer')[0];
		var chatInput = document.getElementsByName('chatInput')[0];
		var sent = chatInput.value;
		if(sent == "")
			return;
		chatInput.value = "";
		if(GP.player != undefined)
			sent = GP.player.getComponent("player").username + " says " + sent;
		else
			sent = "guest says " + sent;
		game.connection.send("chatmessage", { message: sent });
	}
	
	addChat = function(text){
		var chatText = document.getElementsByName('chatTextContainer')[0];
		chatText.innerHTML += text + "<br/>";		
  		chatText.scrollTop = chatText.scrollHeight;	
	}
	
	$("*").click(function(e) {
		$(".chatBox input").focus();
	});
	$(".chatBox input").keydown(function (e) {
		if (e.keyCode == 13) {
			sendChat();
		}
	});
	$(".chatBox input").focus();
</script>-->