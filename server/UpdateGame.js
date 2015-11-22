fs = require("fs");
path = require("path");

updateGame = function() {
	console.log("Updating game...");

	// Get source files
	srcFiles = [];
	findSrcFiles("../game/core/", srcFiles);
	findSrcFiles("../game/", srcFiles);

	// Update temp/DigMiner.js
	{
		var stream = fs.createWriteStream("../temp/DigMiner.js");
		stream.write("/***************************************************************\n");
		stream.write(" * Copyrighted (c) 2015 Virtual Spade UF. All rights reserved. * \n");
		stream.write(" ***************************************************************/\n\n");

		console.log("Source files:")
		for (var i = 0; i < srcFiles.length; ++i) {
			process.stdout.write(".");

			var filePath = srcFiles[i];
			var content = fs.readFileSync(filePath, "utf8");
			stream.write(content);
			stream.write("\n");

		}
		stream.end(" ");
		process.stdout.write("\n");
	}


	// Update source list in temp/debugSources.html
	{
		var stream = fs.createWriteStream("../temp/debugSources.html");
		stream.write(" <!----------------------------------------------------------------->\n");
		stream.write(" <!-- Copyrighted (c) 2015 Virtual Spade UF. All rights reserved. -->\n");
		stream.write(" <!----------------------------------------------------------------->\n\n");

		for (var i = 0; i < srcFiles.length; ++i) {
			var filePath = srcFiles[i];
			stream.write('<script src = "' + filePath.slice(3) +'"></script>');
			stream.write("\n");
		}

		stream.end(" ");
	}

	// Include all source files
	{
		console.log("Loading source files...")
		for (var i = 0; i < srcFiles.length; ++i) {
			process.stdout.write(".");



			var filePath = srcFiles[i];
			var content = fs.readFileSync(filePath, "utf8");
			eval(content);
		}
		process.stdout.write("\n");
	}


	// Copy files to www/
	{
		var mkdir = function(path) {
			if (!fs.existsSync(path))
				fs.mkdirSync(path);
		}

		var copyFile = function(pathA, pathB) {
			if (pathB == undefined)
				pathB = pathA;

			fs.createReadStream("../" + pathA).pipe(fs.createWriteStream("www/" + pathB));
		}

		var copyDir = function(pathA, pathB) {
			var files = [];
			var dirs = [];

			mkdir(pathB);
			findAllFiles(pathA, files, dirs)

			for (var i = 0; i < dirs.length; ++i)
				mkdir(pathB + dirs[i].slice(pathA.length));

			for (var i = 0; i < files.length; ++i) {
				var filePath = files[i].slice(pathA.length);
				console.log("Copying file: " + pathA + filePath);

				fs.createReadStream(pathA + filePath).pipe(fs.createWriteStream(pathB + filePath));
			}
		}

		mkdir("www/");
		mkdir("www/temp/");
		copyFile('index.php');
		copyFile("style.css");
		copyFile("login.html");
		copyFile("loginFrame.html");
		copyFile("playMenu.html");
		copyFile("progress.html");
		copyFile("registerFrame.html");

		mkdir("www/lib/");
		mkdir("www/game/");
		mkdir("www/game/shaders/");
		copyDir("../game/shaders/", "www/game/shaders/");
	}

	// Run Obfuscator
	{
		var exec = require('child_process').exec,
	    child;


	    
	    var fullPath = require('path').dirname(Object.keys(require.cache)[0]) + "\\";
	    fullPath = fullPath.slice(0, fullPath.length - 7) + "temp\\";
	    var command = "java -jar " + fullPath + "yuicompressor.jar " + fullPath + "DigMiner.js -o ..\\temp\\DigMinerMinified.js --charset utf-8";
	    console.log(command);
		
		child = exec(command,
		  function (error, stdout, stderr) {
		    console.log('stdout: ' + stdout);
		    console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }

		    var content = fs.readFileSync("../temp/DigMinerMinified.js");

		    var stream = fs.createWriteStream("www/temp/DigMiner.js");
		    stream.write("/***************************************************************\n");
			stream.write(" * Copyrighted (c) 2015 Virtual Spade UF. All rights reserved. * \n");
			stream.write(" ***************************************************************/\n\n");
		    stream.end(content)
		});
	}

	

	console.log("Game is updated!");
}

findSrcFiles = function(dir, outSrcFiles) {

	var walk = function(dir2) {
		var files = fs.readdirSync(dir2);

		for(var i = 0; i < files.length; ++i) {
			var filePath = dir2 + files[i];
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

findAllFiles = function(dir, outFiles, outDirs) {
	var files = fs.readdirSync(dir);
	for (var i = 0; i < files.length; ++i) {
		var filePath = dir + files[i]
		var stat = fs.statSync(filePath);

		if (stat.isFile()) {
			outFiles.push(filePath);
		}
		else if (stat.isDirectory()) {
			outDirs.push(filePath + "/");
			findAllFiles(filePath + "/", outFiles, outDirs);
		}
	}
}
