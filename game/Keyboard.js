Key = function(keyCode) {
	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
  	//The `downHandler`
  	key.downHandler = function(event) {
    	if (event.keyCode === key.code) {
      		if (key.isUp && key.press) key.press();
      		key.isDown = true;
      		key.isUp = false;
    		}
  	};

  	//The `upHandler`
  	key.upHandler = function(event) {
    	if (event.keyCode === key.code) {
      		if (key.isDown && key.release) key.release();
      		key.isDown = false;
      		key.isUp = true;
    	}
  	};

  	//Attach event listeners
  	window.addEventListener(
    	"keydown", key.downHandler.bind(key), false
  	);
  	window.addEventListener(
    	"keyup", key.upHandler.bind(key), false
  	);
  	return key;
}

Keyboard = function() {
	this.keys = {};
	this.keys.left = new Key(37);
	this.keys.up = new Key(38);
	this.keys.right = new Key(39);
	this.keys.down = new Key(40);
	this.keys.a = new Key(65);
	this.keys.w = new Key(87);
	this.keys.d = new Key(68);
	this.keys.s = new Key(83);
	this.keys.esc = new Key(27);
	this.keys.space = new Key(32);
}

Keyboard.prototype.isKeyDown = function(key) {
	var down = this.keys[key].isDown;
	if(key == "down")
		return down || this.keys["s"].isDown;
	else if(key == "up")
		return down || this.keys["w"].isDown;
	else if(key == "left")
		return down || this.keys["a"].isDown;
	else if(key == "right")
		return down || this.keys["d"].isDown;
	return down;
}

Keyboard.prototype.isKeyUp = function(key) {
	return this.keys[key].isUp;
}

Keyboard.prototype.getPlayState = function() {
	var state = {};
    state.up = this.keys["up"].isDown || this.keys["w"].isDown;
	state.down = this.keys["down"].isDown || this.keys["s"].isDown;
    state.left = this.keys["left"].isDown || this.keys["a"].isDown;
	state.right = this.keys["right"].isDown || this.keys["d"].isDown;
	state.dig = this.keys["space"].isDown;
	return state;
}

Keyboard.prototype.getState = function() {
	var state = {};
    for (var key in this.keys) {
		if (this.keys.hasOwnProperty(key)) {
			var keyValue = this.keys[key];
			state[key] = {};
			state[key].code = keyValue.code;
			state[key].isDown = keyValue.isDown;
			state[key].isUp = keyValue.isUp;
		}
    }
	return state;
}

/*Keyboard.prototype.applyState = function(state) {
    for (var key in state) {
		if (state.hasOwnProperty(key)) {
			var keyValue = state[key];
			
			if(!this.keys[key])
				this.keys[key] = {};
			this.keys[key].code = keyValue.code;
			this.keys[key].isDown = keyValue.isDown;
			this.keys[key].isUp = keyValue.isUp;
		}
    }
}*/

Keyboard.prototype.isDifferent = function(state) {
	if(!state)
		return true;
	
	for (var key in this.keys) {
		if (this.keys.hasOwnProperty(key)) {
			var keyValue = this.keys[key];
			if(state[key]) {
				if(state[key].code != keyValue.code
					|| state[key].isDown != keyValue.isDown
					|| state[key].isUp != keyValue.isUp)
					return true;
			}
			else
				return true;
		}
	}
	return false;
}

var keyboard = new Keyboard();