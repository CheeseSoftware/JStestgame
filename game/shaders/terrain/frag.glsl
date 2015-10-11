#version 100

uniform sampler2D densityTexture;
uniform sampler2D tileTexture;
uniform sampler2D texture;

varying highp vec2 fragUv;
varying highp vec2 fragPos;

#define TILE_DIM 2
#define TILE_DIM_F 2.0

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


/*******************/

highp float sdTorus(highp vec3 p, highp float r1, highp float r2) {
	return length(vec2(length(p.xz)-r1,p.y))-r2;
}

highp float map(highp vec3 pos) {
	highp float dis = max(2.0-pos.z, -length(pos)+16.0);
	dis += sin(pos.x)+sin(pos.y)+sin(pos.z);
	
	dis = min(dis, sdTorus(pos+vec3(0.0 ,0.0, -8.0), 8.0, 2.0));
	
	return dis;
}

highp float raymarch(highp vec3 pos) {

	highp vec3 dir = normalize(vec3(0.0, 1.0, 1.0));
	
	highp float j = 0.0;
	
	for (int i = 0; i < 32; ++i) {
		
		highp float dis = map(pos);
		pos += dir*dis;
		
		j += 1.0/32.0;
		
		if (dis < 0.01)
			break;
	}
	
	return j;
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

void main() {
	
	//highp float dis = 0.5+0.25*raymarch(vec3(fragUv*16.0, 0.0));
	highp float density = getDensity(fragUv);
	highp float alpha = 0.5+0.5*clamp(32.0*(density-0.5), 0.0, 1.0);
	highp float tileID = texture2D(tileTexture, floor(fragUv*30.0+1.0)/32.0).x*255.0;
	highp vec2 texturePos = mod(fragUv*2.0/TILE_DIM_F, 1.0/TILE_DIM_F) + vec2(mod(tileID/TILE_DIM_F, 1.0), mod(floor(tileID/TILE_DIM_F)/TILE_DIM_F, 1.0));
	highp vec3 textureColor = texture2D(texture, texturePos).xyz;
	highp vec3 colorA = textureColor*clamp(0.125+density, 0.5, 1.0);
	highp vec3 colorB = textureColor*clamp(0.5-0.25*density, 0.0, 1.0);
	
	gl_FragColor = vec4(mix(colorB, colorA, clamp(32.0*(density-0.5), 0.0, 1.0)), 1.0);
	
	//if (density == 0.0)
	//	gl_FragColor = vec4(vec3(1.0), 1.0);
}