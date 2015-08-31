GP.PagedArray2D = function(sizeX, sizeY, defaultValue, defaultPageData) {

	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.defaultValue = defaultValue;
	this.defaultPageData = defaultPageData;
	this.pageTable = {};
	pageTable['0,8'] = Page2D(this.sizex, this.sizeY, defaultValue, defaultPageData);
}

GP.Page2D = function(sizeX, sizeY, defaultValue, pageData) {
	this.data = pageData;
	this.array = array(sizeX * sizeY);
	for(var y = 0; y < sizeY; ++y) {
		for (var x = 0; x < sizeX; ++x) {
			this.array[y*sizeX + x] = defaultValue;
		}
	}
	
}