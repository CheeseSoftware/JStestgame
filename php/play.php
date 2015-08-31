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


<!-- libraries -->
<!--<script src="jquery-2.1.x.js"></script>-->
<script src="ces-browser.js"></script>
<script src="pixi.js"></script>
<script src="https://cdn.socket.io/socket.io-1.3.5.js"></script>

<!-- classes -->
<script src="PagedArray2D.js"></script>
<script src="Camera.js"></script>
<script src="Keyboard.js"></script>
<script src="components/Physics.js"></script>
<script src="components/Player.js"></script>
<script src="components/ControlledPlayer.js"></script>
<script src="systems/PhysicsSystem.js"></script>
<script src="systems/ControlSystem.js"></script>
<script src="Connection.js"></script>

<!-- game -->
<script src="GamePrototype.js"></script>

<div class = "playMenu" id = "playMenu">
	<img src="../textures/logo.png" /></img><br/><br/>
	<div class = "button" onclick = "$('#playMenu').remove(); GP.spawnMainPlayer();">
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

<div class="chatBox">
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
		GP.connection.send("chatmessage", { message: sent });
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
</script>