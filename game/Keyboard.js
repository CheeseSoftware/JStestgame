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

var keyboard = new Keyboard();