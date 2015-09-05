#version 100

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
	
	for (int i = 0; i < 128; ++i) {
		
		highp float dis = map(pos);
		pos += 0.25*dir*dis;
		
		j += 1.0/128.0;
		
		if (dis < 0.01)
			break;
	}
	
	return j;
}

void main() {
	
	highp float dis = raymarch(vec3(uv*16.0, 0.0));

	gl_FragColor = vec4(vec3(dis), 1.0);
}