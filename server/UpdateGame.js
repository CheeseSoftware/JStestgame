fs = require("fs");
path = require("path");

updateGame = function() {
	console.log("Updating game...");

	var stream = fs.createWriteStream("../temp/DigMiners.js");
	stream.write("// (c) 2015 Virtual Spade \n\n");


	srcFiles = findSrcFiles("../game/");
	srcContent = "";

	console.log("Source files:")
	for (var i = 0; i < srcFiles.length; ++i) {
		process.stdout.write(".");

		var filePath = srcFiles[i];
		var content = fs.readFileSync(filePath, "utf8");
		stream.write(content);
		stream.write("\n");

	}
	stream.end("\n");
	process.stdout.write("\n");

	console.log("Game is updated!");
}

findSrcFiles = function(dir) {

	var srcFiles = [];

	var walk = function(dir2) {
		var files = fs.readdirSync(dir2);

		for(var i = 0; i < files.length; ++i) {
			var filePath = dir2 + files[i]
			var stat = fs.statSync(filePath);

			if (stat.isFile()) {
				if (path.extname(filePath) == ".js")
					srcFiles.push(filePath);
			}
			else if (stat.isDirectory()) {
				walk(filePath + "/");
			}
		}
	}

	walk(dir);

	/*var dirs = [path];
	while (dirs.length > 0) {
		var files = fs.readdirSync(dirs[0]);
		dirs.splice(0, 1);

		for(var rFile in files) {
			var file = path + rFile;
			console.log("Current file:" + file);
			var stat = fs.statSync(file);

			/*if (stat.isFile())
				srcFiles.push(file);
			else if (stat.isDirectory())
				dirs.push(file);* /
		}
	}*/

	return srcFiles;
}