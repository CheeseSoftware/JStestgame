var inherit = function(child, parent) {
	for (var i in parent) {
		if (!child[i])
        	child[i] = parent[i];
    }
} 
