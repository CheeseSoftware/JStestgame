#version 100

uniform sampler2D densityTexture;
uniform sampler2D tileTexture;
uniform sampler2D texture;

varying highp vec2 fragUv;
varying highp vec2 fragPos;

#define TILE_DIM 2
#define TILE_DIM_F 2.0

struct Tile {
	highp float strength;
	highp float tileID;
};


/* Noise functions */
	highp float rand(highp vec2 co)
{
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}  
	
highp float noise(in highp vec2 pos)
{
	highp vec2 fpos = floor(pos);
	
	highp float r = 0.0;
	
	highp float x1 = abs(1.0-fract(pos.x));
	highp float y1 = abs(1.0-fract(pos.y));
	highp float x2 = abs(fract(pos.x));
	highp float y2 = abs(fract(pos.y));
	
	
	r += rand(fpos+vec2(0.0,0.0))*x1*y1;
	r += rand(fpos+vec2(0.0,1.0))*x1*y2;
	r += rand(fpos+vec2(1.0,0.0))*x2*y1;
	r += rand(fpos+vec2(1.0,1.0))*x2*y2;
	
	return 1.0-2.0*r;
}



highp float getDensity(highp vec2 pos) {
	
	highp float density = texture2D(densityTexture, (pos*30.0+1.0)/32.0).x;
	highp float scale = 32.0;
	for (int i = 0; i < 3; ++i) {
		
		density += 0.2*noise(fragPos*scale);
		scale *= 2.0;
	}
	return density;
	//return 0.5*(sin(pos.x)+sin(pos.y)+2.0);
}

Tile calcTile(highp vec2 tilePos, highp vec2 delta) {
	highp float density = texture2D(densityTexture, tilePos/32.0).x;
	highp float strength = density - delta.x*delta.y;
	highp float tileID = texture2D(tileTexture, tilePos/32.0).x*255.0;
	
	strength -= 0.5*noise(32.0*fragUv+0.2*tileID);// + vec2(0.2*tileID, 0.2*mod(tileID, 4.0)));
	strength -= 0.5*noise(64.0*fragUv+0.2*tileID);// + vec2(0.2*tileID, 0.2*mod(tileID, 4.0)));
	strength -= 0.5*noise(128.0*fragUv+0.2*tileID);// + vec2(0.2*tileID, 0.2*mod(tileID, 4.0)));
	//strength += getDensity(fragUv);
	
	return Tile(strength, tileID);
}

void main() {
	
	highp vec4 tilePos = vec4(floor(fragUv*30.0+vec2(0.5)), vec2(0.0));
	tilePos = vec4(tilePos.xy, tilePos.xy+1.0);
	
	highp vec4 delta = abs(vec4(tilePos.xy - (fragUv*30.0+0.5), tilePos.zw - (fragUv*30.0+0.5)));
	
	Tile a = calcTile(tilePos.xy, delta.xy);
	Tile b = calcTile(tilePos.zy, delta.zy);
	Tile c = calcTile(tilePos.xw, delta.xw);
	Tile d = calcTile(tilePos.zw, delta.zw);
	
	highp float strongest2nd = -1.0;
	
	Tile tile = a;
	if (b.strength > tile.strength) {
		tile = b;
	}	
	if (c.strength > tile.strength) {
		tile = c;
	}
	if (d.strength > tile.strength) {
		tile = d;
	}
	
	if (a.strength > strongest2nd && a.strength < tile.strength) {
		strongest2nd = a.strength;
	}	
	if (b.strength > strongest2nd && b.strength < tile.strength) {
		strongest2nd = b.strength;
	}	
	if (b.strength > strongest2nd && b.strength < tile.strength) {
		strongest2nd = c.strength;
	}
	if (b.strength > strongest2nd && b.strength < tile.strength) {
		strongest2nd = d.strength;
	}
	
	highp float deltaStrength = 1.0;//clamp(tile.strength - strongest2nd, 0.0, 1.0);
	
	//highp float dis = 0.5+0.25*raymarch(vec3(fragUv*16.0, 0.0));
	highp float density = getDensity(fragUv);
	highp float alpha = 0.5+0.5*clamp(32.0*(density-0.5), 0.0, 1.0);
	
	
	
	
	highp float tileID = tile.tileID;//texture2D(tileTexture, floor(fragUv*30.0+1.0)/32.0).x*255.0;
	highp vec2 texturePos = mod(fragUv*2.0/TILE_DIM_F, 1.0/TILE_DIM_F) + vec2(mod(tileID/TILE_DIM_F, 1.0), mod(floor(tileID/TILE_DIM_F)/TILE_DIM_F, 1.0));
	highp vec3 textureColor = texture2D(texture, texturePos).xyz;
	highp vec3 colorA = textureColor*clamp(0.125+density+0.5*(deltaStrength-1.0), 0.5, 1.0);
	highp vec3 colorB = textureColor*clamp(0.5-0.25*density, 0.0, 1.0);
	
	gl_FragColor = vec4(mix(colorB, colorA, clamp(32.0*(density-0.5), 0.0, 1.0)), 1.0);
	
	//if (density == 0.0)
	//	gl_FragColor = vec4(vec3(1.0), 1.0);
}