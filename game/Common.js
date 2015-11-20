var g_includedFiles = {}
var g_includeRequests = [];
var g_currentFile = 0;
var g_includeFinished = false;
var g_includeIntervalID = null
var g_includeFinishCallback = null;

include = function(filePath) {
	if (g_includedFiles.hasOwnProperty(filePath))
		return;

	g_includedFiles[filePath] = true;


	var includeRequest = new XMLHttpRequest();
	includeRequest.open('GET', filePath);
	includeRequest.onreadystatechange = function() {
		data = includeRequest.responseText;
		eval(data);
	};
	includeRequest.send();
}

finishInclude = function(callback) {
	if (g_includeFinished) {
		console.log("ERROR: finishInclude is executed multiple times!")
		return;
	}

	g_includeFinished = true;
	g_includeFinishCallback = callback;

	g_includeIntervalID = setInterval(_finishIncludeUpdate, 50);
}

_finishIncludeUpdate = function() {
	for (var i = g_currentFile; i < g_includeRequests.length; ++i) {
		if(g_includeRequests[i].readyState != 4)
			return;
		g_currentFile = i+1;
	}

	clearInterval(g_includeIntervalID);
	g_includeFinishCallback();
}