/* 
 * A signed distance field.
 * Uses paging to minimize memory usage.
 */
DensityField = function(sizeX, sizeY) {
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.array = new PagedArray2D(sizeX, sizeY, 255);
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
	
	if (x1 < 0 || y1 < 0 || x2 >= this.sizeX || y2 >= this.sizeY)
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
		this.getDensityNearest(x1, y1),
		this.getDensityNearest(x2, y1),
		this.getDensityNearest(x1, y2),
		this.getDensityNearest(x2, y2)
	];
	
	return a[0] * a[1] * b [0] +
		   a[2] * a[1] * b [1] +
		   a[0] * a[3] * b [2] +
		   a[2] * a[3] * b [3];
}

DensityField.prototype.calcNormal = function(x, y) {
	var epsilon = 0.1;
	var a = -this.getDensity(x+epsilon, y+epsilon);
	var b = -this.getDensity(x-epsilon, y+epsilon);
	var c = -this.getDensity(x-epsilon, y-epsilon);
	var d = -this.getDensity(x+epsilon, y-epsilon);
	
	var f = vec2.fromValues(+a, +a);
	var g = vec2.fromValues(-b, +b);
	var h = vec2.fromValues(-c, -c);
	var i = vec2.fromValues(+d, -d);
	
	var vec = vec2.create();
	vec2.add(vec, vec, f);
	vec2.add(vec, vec, g);
	vec2.add(vec, vec, h);
	vec2.add(vec, vec, i);
	if (vec2.sqrDist(vec, vec2.create()) > 0.0)
		vec2.normalize(vec, vec);
	
	return vec;
}

// TODO: calcNormal(x, y)

