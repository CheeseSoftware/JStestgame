/* 
 * A signed distance field.
 * Uses paging to minimize memory usage.
 */
DensityField = function(sizeX, sizeY) {
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.array = PagedArray2D(sizeX, sizeY, 5.0);
}

/**
 * Returns distance by nearest neighbor.
 */
DensityField.prototype.getDensityNearest = function(x, y) {
	return this.array.get(x, y);
}

/**
 * Returns distance using bilinear interpolation.
 */
DensityField.prototype.getDensity = function(x, y) {
	var x1 = Math.floor(x);
	var y1 = Math.floor(y);
	var x2 = x1 + 1;
	var y2 = y1 + 1;
	
	if (x1 < 0 || y1 < 0 || x2 >= sizeX || y2 >= sizeY)
		return 5.0;
		
	var fractX = x - x1;
	var fractY = y - y1;
	
	var a = [
		1.0 - fractX,
		1.0 - fractY,
		fractX,
		fractY
	];
	var b = [
		this.getNearest(x1, y1),
		this.getNearest(x2, y1),
		this.getNearest(x1, y2),
		this.getNearest(x2, y2)
	];
	
	return a[0] * a[1] * b [0] +
		   a[2] * a[1] * b [1] +
		   a[0] * a[3] * b [2] +
		   a[2] * a[3] * b [3];
}

// TODO: calcNormal(x, y)

