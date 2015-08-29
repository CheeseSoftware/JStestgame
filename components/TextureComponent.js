
ECS.Components.Texture = function TextureComponent ( params ){
    params = params || {};
	
    this.width = params.width;
    this.height = params.height;
	var imgName = params.imgsrc;
	
	this.img = new Image();
	this.img.src = "textures/" + imgName;

    return this;
};
ECS.Components.Texture.prototype.name = 'texture';