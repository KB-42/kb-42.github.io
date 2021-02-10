var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec4 vColor;
	attribute vec4 vNormal;
	attribute vec2 vTexCoord;

	uniform mat4 M_comp; // model
	uniform mat4 M_camera;
	uniform mat4 M_project;
	uniform mat4 M_worldInverse;

	uniform vec4 lightPosition;
	uniform vec4 u_viewWorldPosition;

	uniform float bool_drawingSun;
	uniform float bool_drawingOrbitPath;

	varying vec3 N, L, E;
	varying vec3 v_surfaceToView;
	varying vec2 fTexCoord;
	varying float boo_orbitPath;
	varying vec4 fColor;

	void main() {

		if (bool_drawingOrbitPath == 1.0) {
			fColor = vColor;
			gl_PointSize = 10.0;
			gl_Position = M_project * M_camera * M_comp * vPosition;
			fTexCoord = vTexCoord;

		} else {
			boo_orbitPath = bool_drawingOrbitPath;

			gl_Position = M_project * M_camera * M_comp * vPosition; // correct

			//N = normalize((vNormal * -(M_project * M_camera * M_comp) ).xyz); // correct

			N = normalize(((M_project * M_comp) * vNormal).xyz); // correct

			//vec3 ps1 = -(vPosition * (M_worldInverse) ).xyz;

			vec3 pos = (vPosition * (M_worldInverse) ).xyz; // THE WAY TO DO IT

			if (bool_drawingSun == 1.0) {
				N = normalize((( M_camera) * vNormal).xyz);
				pos = -((M_camera) * vPosition).xyz;
			}

	    vec3 light = lightPosition.xyz;

	    L = normalize( light - pos  ); // correct suface to light
	    E =  -pos;
			v_surfaceToView = normalize(gl_Position.xyz - L);

			fTexCoord = vTexCoord;
		}







	}
`;

var OrbitPathVertexShader = `
	attribute vec4 vPosition;

	uniform mat4 M_comp;
	uniform mat4 M_camera;
	uniform mat4 M_project;

	void main() {
		float size = 20.0;
		gl_PointSize = size;
		gl_Position = M_project * M_camera * M_comp * vPosition;

		gl_Position = vPosition;
	}
`;
