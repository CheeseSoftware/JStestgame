AudioManager = function() {
	
	this._context = null;
	
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this._context = new AudioContext();
	}
	catch(e) {
		alert("Web Audio API is not supported in this browser!");
	}
	
	this.testSoundBuffer = null;
	
	loadTestSound("audio/footstep.wav");
}

AudioManager.prototype.loadTestSound = function(url) {
	
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	
	request.onload = function() {
		context.decodeAudioData(request.response, (function(buffer) {
			this.testSoundBuffer = buffer;
		}).bind(this), onError);
	}
}