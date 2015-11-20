g_includedFiles = {}

var include = function( lib ) {
	if (g_includedFiles.hasOwnProperty(lib))
		return;

	g_includedFiles[lib] = true;

	data = fs.readFileSync("../" + lib, 'utf8');

	eval(data);
}