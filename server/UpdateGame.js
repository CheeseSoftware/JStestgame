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
		//stream.write("var _s_ = function() {");

		console.log("Source files:")
		for (var i = 0; i < srcFiles.length; ++i) {
			process.stdout.write(".");

			var filePath = srcFiles[i];
			var content = fs.readFileSync(filePath, "utf8");
			stream.write(content);
			stream.write("\n");

		}
		stream.end("var game = new Game();");
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
				

				var extName = path.extname(filePath);

				// Check if the size is the same
				if (extName != ".js" &&
					extName != ".glsl" &&
				    fs.existsSync(pathB + filePath))
				{
					var statsA = fs.statSync(pathA + filePath);
					var statsB = fs.statSync(pathB + filePath);
					var sizeA = statsA["size"];
					var sizeB = statsB["size"];

					// Don't copy if the size is the same
					if (sizeA == sizeB)
						continue;
				}

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
		mkdir("www/game/textures/")
		copyDir("../game/shaders/", "www/game/shaders/");
		copyDir("../game/textures/", "www/game/textures/");

		if(process.argv.length >= 3 && process.argv[2] == "update") {
			copyDir("../lib/", "www/lib/");
		}

	}

	// Run Obfuscator
	{
		var exec = require('child_process').exec,
	    child;


	    
	    var fullPath = require('path').dirname(Object.keys(require.cache)[0]) + "/";
	    fullPath = fullPath.slice(0, fullPath.length - 7) + "temp/";
	    var command = "java -jar " + fullPath + "yuicompressor.jar " + fullPath + "DigMiner.js -o ../temp/DigMinerMinified.js --charset utf-8";
	    command = command.replace("\\", "/");
	    console.log(command);
		
		child = exec(command,
			function (error, stdout, stderr) {
				if (error !== null) {
				  console.log('exec error: ' + error);
			}
			var UglifyJS = require("uglify-js");
			
			var content = fs.readFileSync("../temp/DigMinerMinified.js") + ";";
			content2 = "var f = 3;"
				+ "k = 3;"
				+ "var i = function() { this.k = 8; var i = 4; i = 5; f = 4; return this;};"
				+ "k += 3;"
				+ "k.apa = '3';"
				+ "k['t'] = f;"
				+ "k.moo = k.apa;"
				+ "for (var i = 0; i < 8; ++i) console.log(i);"
				+ "var e = {a: new i(), b: 4, c: 5}";


			var options =  undefined;
			{
				beautify: true
			};

			//var result = UglifyJS.minify(content + ";", {fromString: true, mangle: true});
			var toplevel = UglifyJS.parse(content, options);
			toplevel.figure_out_scope();

			var names = [];
			var nameTable = {};
			var newNameTable = {};
			var nameIndex = 0;

			var excludedNames = {
				"isServer": true,
				"keyboard": true,
				"t": true,
				"send": true,
				"on": true,
				"Hud": true,
				"e": true,
				"this": true,
				"Object": true,
				"PIXI": true,
				"Date": true,
				"Keyboard": true,
				"keyboard": true,
				"keyboard": true,
				"keyboard": true,
				"keyboard": true,
			};

			var confuseNameList = [
				"class",
				"function",
				"prototype",
				"header",
				"source",
				"lambda",
				"observer",
				"dig",
				"var",
				"char",
				"string",
				"float",
				"number",
				"__int__",
				"__uint__",
				"list",
				"array",
				"world",
				"table",
				"module",
				"abstract",
				"case",
				"continue",
				"double",
				"extends",
				"for",
				"import",
				"let",
				"package",
				"short",
				"this",
				"this",
				"this",
				"this",
				"that",
				"with",
				"try",
				"while",
				"arguments",
				"catch",
				"debugger",
				"else",
				"false",
				"function",
				"in",
				"long",
				"private",
				"static",
				"throw",
				"typeof",
				"with",
				"boolean",
				"break",
				"byte",
				"char",
				"class",
				"const",
				"default",
				"delete",
				"do",
				"enum",
				"eval",
				"export",
				"final",
				"finally",
				"goto",
				"if",
				"implements",
				"char",
				"instanceof",
				"int",
				"interface",
				"native",
				"new",
				"null",
				"char",
				"ChunkManager",
				"KDTree",
				"Quadtree",
				"Iphone",
				"Illuminati",
				"HALF_LIFE_3",
				"Copyrighted",
				"manager",
				"FAN_VAD_TREVLIGT",
				"ABC",
				"POD",
				"OOP",
				"DATA",
				"NULL",
				"NAN"
			]

			var genName = function() {
				var name = "";
				var random = Math.floor(Math.random()*10);
				name = "q_" + nameIndex.toString();
				nameIndex++;

				
				if (random > 2) {
					name = confuseNameList[Math.floor(Math.random()*confuseNameList.length)];
		    		if (!newNameTable.hasOwnProperty("_"+name+"_"))
		    			name = "_" + name;
		    		while(newNameTable.hasOwnProperty(name)) {
		    			name = name + "_" + confuseNameList[Math.floor(Math.random()*confuseNameList.length)];
		    		}
		    	}
		    	if (random == 3) {
					name = name + nameIndex.toString();
				}

		    	return name;
			}

			//Obfuscate names
			var transformer = new UglifyJS.TreeTransformer(function(node, descend){
			    if (node instanceof UglifyJS.AST_SymbolDeclaration) {
			    	if (!excludedNames.hasOwnProperty(node.name) && node.name.length > 1) {
				    	if (!nameTable.hasOwnProperty(node.name)) {
				    		var confusingName = node.name + "___";//genName();
				    		newNameTable[confusingName] = node.name;
				    		nameTable[node.name] = confusingName;
				    		names.push(node.name);

				    		if (node.Name == "keyboard___")
				    			console.log(node);
						}
					}
			    }
				var deep_clone = 
			    	node = node.clone();
			    descend(node, this);
			    return node;
			});
			var ast2 = toplevel.transform(transformer);

			function findPositions(str, text) {
				var regex = new RegExp(text, "gi"); //"/" + text + "/gi";
				var result;
				var indices = [];
				while ( (result = regex.exec(str)) ) {
				    indices.push(result.index);
				}
				return indices;
			}

			//Compressor
			var compressor = UglifyJS.Compressor(options);
			var compressed_ast = toplevel.transform(compressor);

			//Mangle
			compressed_ast.figure_out_scope();
			compressed_ast.compute_char_frequency();
			compressed_ast.mangle_names();

			//Code:
			var stream2 = UglifyJS.OutputStream(options);
			compressed_ast.print(stream2);
			var code = stream2.toString(); // this is your minified code
			//var code = fs.readFileSync("../temp/DigMiner.js");

			var tempTable = {};

			var isCharOrNumber = function(index) {
				if (index < 0 || index >= code.length)
					return false;

				var c = code[index] + "";
				var has = tempTable.hasOwnProperty(c);
				if (!has)
					console.log("?: " + c);
				tempTable[c] = true;
				
				if (c == "_" || c == "/")
					return true;
				if (c.toLowerCase() != c.toUpperCase())
					return true;
				var c2 = c.charCodeAt(0);
				if (c2 >= 48 && c2 <= 57)
					return true;

				if (!has)
					console.log("false");
				return false;
			}

			var code2 = "";


			// Obfuscate names:
			for (var i = 0; i < names.length; ++i) {
				var name = names[i];
				console.log(name + ": " + name.length + " i:" + i);
				var positions = findPositions(code, name);
				var move = 0;
				for (var j = 0; j < positions.length; ++j) {
					var pos = positions[j];
					var index = pos + move;

					if (isCharOrNumber(index-1))
						continue;
					if (isCharOrNumber(index+name.length))
						continue;

					var newStr = code.substr(0, index) + nameTable[name] + code.substr(index+name.length);
					move += newStr.length - code.length;
					code = newStr;
				}
				if (i > 2000)
					break;
			}
			//code.replace("  ", "\n");
			
			var stream = fs.createWriteStream("www/temp/DigMiner.js");
			stream.write("/***************************************************************\n");
			stream.write(" * Copyrighted (c) 2015 Virtual Spade UF. All rights reserved. * \n");
			stream.write(" ***************************************************************/\n\n");
			stream.end(code)

			console.log("Obfuscation done!");
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
