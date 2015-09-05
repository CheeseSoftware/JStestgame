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


<!-- box2djs -->
<script src="lib/prototype-1.6.0.2.js"></script>
<script src='js/box2d/common/b2Settings.js'></script>
<script src='js/box2d/common/math/b2Vec2.js'></script>
<script src='js/box2d/common/math/b2Mat22.js'></script>
<script src='js/box2d/common/math/b2Math.js'></script>
<script src='js/box2d/collision/b2AABB.js'></script>
<script src='js/box2d/collision/b2Bound.js'></script>
<script src='js/box2d/collision/b2BoundValues.js'></script>
<script src='js/box2d/collision/b2Pair.js'></script>
<script src='js/box2d/collision/b2PairCallback.js'></script>
<script src='js/box2d/collision/b2BufferedPair.js'></script>
<script src='js/box2d/collision/b2PairManager.js'></script>
<script src='js/box2d/collision/b2BroadPhase.js'></script>
<script src='js/box2d/collision/b2Collision.js'></script>
<script src='js/box2d/collision/Features.js'></script>
<script src='js/box2d/collision/b2ContactID.js'></script>
<script src='js/box2d/collision/b2ContactPoint.js'></script>
<script src='js/box2d/collision/b2Distance.js'></script>
<script src='js/box2d/collision/b2Manifold.js'></script>
<script src='js/box2d/collision/b2OBB.js'></script>
<script src='js/box2d/collision/b2Proxy.js'></script>
<script src='js/box2d/collision/ClipVertex.js'></script>
<script src='js/box2d/collision/shapes/b2Shape.js'></script>
<script src='js/box2d/collision/shapes/b2ShapeDef.js'></script>
<script src='js/box2d/collision/shapes/b2BoxDef.js'></script>
<script src='js/box2d/collision/shapes/b2CircleDef.js'></script>
<script src='js/box2d/collision/shapes/b2CircleShape.js'></script>
<script src='js/box2d/collision/shapes/b2MassData.js'></script>
<script src='js/box2d/collision/shapes/b2PolyDef.js'></script>
<script src='js/box2d/collision/shapes/b2PolyShape.js'></script>
<script src='js/box2d/dynamics/b2Body.js'></script>
<script src='js/box2d/dynamics/b2BodyDef.js'></script>
<script src='js/box2d/dynamics/b2CollisionFilter.js'></script>
<script src='js/box2d/dynamics/b2Island.js'></script>
<script src='js/box2d/dynamics/b2TimeStep.js'></script>
<script src='js/box2d/dynamics/contacts/b2ContactNode.js'></script>
<script src='js/box2d/dynamics/contacts/b2Contact.js'></script>
<script src='js/box2d/dynamics/contacts/b2ContactConstraint.js'></script>
<script src='js/box2d/dynamics/contacts/b2ContactConstraintPoint.js'></script>
<script src='js/box2d/dynamics/contacts/b2ContactRegister.js'></script>
<script src='js/box2d/dynamics/contacts/b2ContactSolver.js'></script>
<script src='js/box2d/dynamics/contacts/b2CircleContact.js'></script>
<script src='js/box2d/dynamics/contacts/b2Conservative.js'></script>
<script src='js/box2d/dynamics/contacts/b2NullContact.js'></script>
<script src='js/box2d/dynamics/contacts/b2PolyAndCircleContact.js'></script>
<script src='js/box2d/dynamics/contacts/b2PolyContact.js'></script>
<script src='js/box2d/dynamics/b2ContactManager.js'></script>
<script src='js/box2d/dynamics/b2World.js'></script>
<script src='js/box2d/dynamics/b2WorldListener.js'></script>
<script src='js/box2d/dynamics/joints/b2JointNode.js'></script>
<script src='js/box2d/dynamics/joints/b2Joint.js'></script>
<script src='js/box2d/dynamics/joints/b2JointDef.js'></script>
<script src='js/box2d/dynamics/joints/b2DistanceJoint.js'></script>
<script src='js/box2d/dynamics/joints/b2DistanceJointDef.js'></script>
<script src='js/box2d/dynamics/joints/b2Jacobian.js'></script>
<script src='js/box2d/dynamics/joints/b2GearJoint.js'></script>
<script src='js/box2d/dynamics/joints/b2GearJointDef.js'></script>
<script src='js/box2d/dynamics/joints/b2MouseJoint.js'></script>
<script src='js/box2d/dynamics/joints/b2MouseJointDef.js'></script>
<script src='js/box2d/dynamics/joints/b2PrismaticJoint.js'></script>
<script src='js/box2d/dynamics/joints/b2PrismaticJointDef.js'></script>
<script src='js/box2d/dynamics/joints/b2PulleyJoint.js'></script>
<script src='js/box2d/dynamics/joints/b2PulleyJointDef.js'></script>
<script src='js/box2d/dynamics/joints/b2RevoluteJoint.js'></script>
<script src='js/box2d/dynamics/joints/b2RevoluteJointDef.js'></script>
<!--=============================-->

<!-- libraries -->
<!--<script src="jquery-2.1.x.js"></script>-->
<script src="lib/ces-browser.js"></script>
<script src="lib/pixi.js"></script>
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
<script src="game/Shader.js"/></script>
<script src="game/ShaderProgram.js"/></script>
<script src="game/DensityField.js"/></script>
<script src="game/Terrain.js"/></script>

<!-- game -->
<script src="game/Game.js"></script>
<script>
	var game = new Game();
</script>

<div class = "playMenu" id = "playMenu">
	<img src="../textures/logo.png" /></img><br/><br/>
	<div class = "button" onclick = "document.getElementById('playMenu').remove(); game.spawnMainPlayer();">
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