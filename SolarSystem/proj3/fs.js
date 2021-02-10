var myFragmentShader =`
	precision mediump float;

	uniform vec4 ambientProduct;
	uniform vec4 diffuseProduct;
	uniform vec4 specularProduct;
	uniform float shininess;
	varying vec3 N, L, E;

	//varying vec3 v_surfaceToView;
	varying vec3 v_surfaceToView;

	uniform sampler2D texture;
	varying vec2 fTexCoord;
	varying float boo_orbitPath;
	varying vec4 fColor;

	void main() {

		if (boo_orbitPath == 1.0) {
			//gl_FragColor = fColor; //vec4(1.0,1.0,1.0,1.0);

			//gl_FragColor = vec4(1.0,1.0,1.0,1.0) * texture2D(texture, fTexCoord);

			gl_FragColor = texture2D(texture, fTexCoord) * fColor;

		} else {
			vec4 fColor;

	    vec3 H = normalize( L + E);

	    vec4 ambient = ambientProduct;

	    float Kd = dot(N, L);

	    vec4  diffuse = Kd * diffuseProduct;

			float Ks = pow(dot(N, H), shininess );

	    vec4  specular = Ks * specularProduct;

	    if( dot(N, L) < 0.0 ) specular = vec4(0.0, 0.0, 0.0, 1.0);

	    fColor = ambient + diffuse + specular;

			fColor.a = 1.0;


			//gl_FragColor = fColor;
			gl_FragColor = fColor * texture2D(texture, fTexCoord);
			//gl_FragColor = texture2D(texture, fTexCoord);
		}





	}
`;

var OrbitPathFragShader = `
	precision mediump float;

	void main() {
		gl_FragColor = vec4(0.0,1.0,0.0,1.0);
	}
`;
