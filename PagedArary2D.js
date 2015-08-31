GP.PagedArray2D = function(sizeX, sizeY, defaultValue, defaultPageData) {

	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.defaultValue = defaultValue;
	this.defaultPageData = defaultPageData;
	this.pages = {};
	this.pages['0,8'] = Page2D(this.sizex, this.sizeY, defaultValue, defaultPageData);
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

GP.PagedArray2D.prototype.get(x, y, value) {
	
	var pageX = x/this.sizeX;
	var pageY = y/this.sizeY;
	var localX = x%this.sizeX;
	var localY = y%this.sizeY;
	
	// Fix indexing of negative values:
	if (x < 0)
		pageX--;
	if (x < 0)
		pageY--;
	
	
	var pagePosString = pageX + "," + pageY;
	
	if (!this.pages.hashOwnProperty(pagePosString)) {
		return this.defaultValue;
	}
	
	return pages[pagePosString].get(localX, localY);
}

GP.PagedArray2D.prototype.set(x, y, value) {
	
	var pageX = x/this.sizeX;
	var pageY = y/this.sizeY;
	var localX = x%this.sizeX;
	var localY = y%this.sizeY;
	
	// Fix indexing of negative values:
	if (x < 0)
		pageX--;
	if (x < 0)
		pageY--;
		
	var pagePosString = pageX + "," + pageY;
	
	if (!this.pages.hashOwnProperty(pagePosString)) {
		Page2D page = Page2D(this.sizeX, this.sizeY, this.defaultValue);
		page.set(localX, localY, value);
		pages[pagePosString] = page;
	}
	else {
		pages[pagePosString].set(localX, localY, value);
	}
}