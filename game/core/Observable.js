
Observable = function() {
	this._subscribers = [];
	this._subscribeFunctions = [];
	this._functions = [];
	for(var i = 0; i < arguments.length; ++i)
		this._functions.push(arguments[i]);
}

Observable.prototype.on = function(functionName) {	
	var args = [];
	for(var i = 1; i < arguments.length; ++i)
		args.push(arguments[i]);

	for (var i = 0; i < this._subscribers.length; ++i) {
		var that = this._subscribers[i];
		if (!that[functionName])
			continue;
		that[functionName].apply(that, args);
	}
	
	for(var i = 0; i < this._subscribeFunctions.length; ++i) {
		var couple = this._subscribeFunctions[i];
		if(couple.name == functionName)
			couple.func.apply(couple.func, args);
	}
}

Observable.prototype.subscribe = function(subscriber) {
	// This is only debug code. Class can subscribe but maybe not all of the events.
	/*for (var i = 0; i < this._functions.length; ++i) {
		if (!(typeof subscriber[this._functions[i]] == "function")) {
			console.log("Subscriber is missing function '" + this._functions[i] + "'!");
		}
	}*/
	this._subscribers.push(subscriber);
}

Observable.prototype.subscribeFunc = function(name, func) {
	this._subscribeFunctions.push({ name: name, func: func });
}