Observable = function(functions) {
	this._subscribers = [];
	this._functions = functions;
}

Observable.prototype.on = function(functionName, arguments) {
	
	for (var i = 0; i < this._subscribers.length; ++i) {
		var that = this._subscribers[i];
		if (!that[functionName])
			continue;
		that[functionName].apply(that, arguments);
	}
	
}

Observable.prototype.subscribe = function(subscriber) {
	
	
	for (var i = 0; i < this._functions.length; ++i) {
		if (!(typeof subscriber[this._functions[i]] == "function")) {
			console.log("Subscriber is missing function '" + this._functions[i] + "'!");
			//return;
		}
	}
	
	this._subscribers.push(subscriber);
}