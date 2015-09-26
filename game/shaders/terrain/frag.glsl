#version 100

uniform sampler2D densityTexture;
uniform sampler2D texture;

varying highp vec2 uv;

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
	
	return texture2D(densityTexture, (pos*30.0+1.0)/32.0).x;
	//return 0.5*(sin(pos.x)+sin(pos.y)+2.0);
}

void main() {
	
	//highp float dis = 0.5+0.25*raymarch(vec3(uv*16.0, 0.0));
	highp float density = getDensity(uv);
	highp float alpha = 0.5+0.5*clamp(32.0*(density-0.5), 0.0, 1.0);
	highp vec3 textureColor = texture2D(texture, uv*2.0).xyz;
	highp vec3 colorA = textureColor*clamp(density, 0.5, 1.0);
	highp vec3 colorB = textureColor*clamp(0.5-0.5*density, 0.0, 1.0);
	
	gl_FragColor = vec4(mix(colorB, colorA, clamp(32.0*(density-0.5), 0.0, 1.0)), 1.0);
	
	//if (density == 0.0)
	//	gl_FragColor = vec4(vec3(1.0), 1.0);
}