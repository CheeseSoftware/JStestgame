fs = require("fs");
path = require("path");

updateGame = function() {
	console.log("Updating game...");

	var stream = fs.createWriteStream("../temp/DigMiner.js");
	stream.write("/************************************************************\n");
	stream.write(" * Copyrighted (c) 2015 Virtual Spade UF. All rights reserved. \n");
	stream.write(" ************************************************************/\n\n");


	srcFiles = [];
	findSrcFiles("../game/core/", srcFiles);
	findSrcFiles("../game/", srcFiles);

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


	// Run Obfuscator

	var exec = require('child_process').exec,
    child;

    var command = "java -jar ../temp/yuicompressor.jar ../temp/DigMiner.js -o ../temp/DigMinerObfuscated.js --charset utf-8";

/*
	child = exec(command,
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
	});*/

	console.log("Game is updated!");
}

findSrcFiles = function(dir, outSrcFiles) {

	var walk = function(dir2) {
		var files = fs.readdirSync(dir2);

		for(var i = 0; i < files.length; ++i) {
			var filePath = dir2 + files[i]
			var stat = fs.statSync(filePath);

			if (stat.isFile()) {
				if (path.extname(filePath) != ".js")
					continue;

				outSrcFiles.push(filePath);
			}
			else if (stat.isDirectory()) {
				if (files[i] == "core")
					continue;

				walk(filePath + "/");
			}
		}
	}

	walk(dir);
	return srcFiles;
}