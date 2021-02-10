/* Author: Jacob Denton
 * Date: 11-27-2019
 * For: ITCS-3120-001
 */



var canvas;
var gl;
var program;
var vertexShader, fragmentShader;
var vertexShader2, fragmentShader2;
var compiled;
var selection = 'y';

// Data structs.
var tri_verts  = [];
var tri_colors = [];
var normalsArray = [];
var tri_tcoords = [];
var OrbitPathPoints = [];
var orbitPathColors = [];

var vColor, vPosition, vNormal, vTexCoord;
var M_Loc;
var M_camera;
var M_project;
var viewWorldPositionLocation
var bool_drawingSunLocation;
var bool_drawingOrbitPathlocation;

var img_sun,img_mer,img_ven,img_ear,img_mar,img_jup,img_sat,img_ura,img_nep,img_plu,img_wht;
var tex_sun,tex_mer,tex_ven,tex_ear,tex_mar,tex_jup,tex_sat,tex_ura,tex_nep,tex_plu,tex_wht;

const RenderMode = {
  TOP: 0,
  SIDE: 1,
  SUN: 2,
  MERCURY: 3,
  VENUS: 4,
  EARTH: 5,
  MARS: 6,
  JUPITER: 7,
  SATURN: 8,
  URANUS: 9,
  NEPTUNE: 10,
  PLUTO: 11
};
var render_mode = RenderMode.TOP;

// -- Lighting related vars
var lightAmbient, lightDiffuse, lightSpecular;
var lightPosition;

// -- Material related.
var materialAmbient, materialDiffuse, materialSpecular;
var materialShininess;
var ambientProduct, diffuseProduct, specularProduct;

var locked_framerate = true;

// all initializations
window.onload = function init() {
  // get canvas handle
  canvas = document.getElementById( "gl-canvas" );

	// WebGL Initialization
  gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
	if ( !gl ) {
		alert( "WebGL isn't available" );
	}
	gl.viewport( 0, 0, canvas.width, canvas.height );
  pathsState();
	gl.clear( gl.COLOR_BUFFER_BIT );

	// create shaders, compile and link program
	program = createShaders();
  gl.useProgram(program);

	// Create the various vertices
  createOrbitPathVerts();
  drawSphere();
  mapSphereTexture();

  // --- Lighting related --- \\
  lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
  lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
  materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
  materialShininess = 100.0;

  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);

  gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
  // buffers to hold cube vertices and its colors
  vBuffer = gl.createBuffer();
  nBuffer = gl.createBuffer();
  tBuffer = gl.createBuffer();

  vColor = gl.getAttribLocation( program, "vColor");

	// allocate space for points
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(tri_verts), gl.STATIC_DRAW);

  // variables through which shader receives vertex and other attributes
	vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

  // normals buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormal );


  // Texture coords.
  gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_tcoords), gl.STATIC_DRAW );
  vTexCoord = vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
  gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray(vTexCoord);


	// a location for the matrix to be sent to share with the shader
	M_Loc     = gl.getUniformLocation(program, "M_comp");
  M_camera  = gl.getUniformLocation(program, "M_camera");
  M_project = gl.getUniformLocation(program, "M_project");
  M_worldInverse = gl.getUniformLocation(program, "M_worldInverse");
  viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
  bool_drawingSunLocation = gl.getUniformLocation(program, "bool_drawingSun");
  bool_drawingOrbitPathlocation = gl.getUniformLocation(program, "bool_drawingOrbitPath");


  /* configue planet textures */
  img_sun = new Image();
  img_sun.src = "./textures/sunmap.jpg";
  img_sun.onload = function() {
    tex_sun = configureTexture(img_sun);
    console.log("Loaded the sun");
  }

  img_mer = new Image();
  img_mer.src = "./textures/mercurymap.jpg"
  img_mer.onload = function() {
    tex_mer = configureTexture(img_mer);
  }

  img_ven = new Image();
  img_ven.src = "./textures/venusmap.jpg";
  img_ven.onload = function() {
    tex_ven = configureTexture(img_ven);
  }

  img_ear = new Image();
  img_ear.src = "./textures/earthmap.jpg";
  img_ear.onload = function() {
    tex_ear = configureTexture(img_ear);
  }

  img_ear = new Image();
  img_ear.src = "./textures/earthmap.jpg";
  img_ear.onload = function() {
    tex_ear = configureTexture(img_ear);
  }

  img_mar = new Image();
  img_mar.src = "./textures/marsmap.jpg";
  img_mar.onload = function() {
    tex_mar = configureTexture(img_mar);
  }

  img_jup = new Image();
  img_jup.src = "./textures/jupitermap.jpg";
  img_jup.onload = function() {
    tex_jup = configureTexture(img_jup);
  }

  img_sat = new Image();
  img_sat.src = "./textures/saturnmap.jpg";
  img_sat.onload = function() {
    tex_sat = configureTexture(img_sat);
  }

  img_ura = new Image();
  img_ura.src = "./textures/uranusmap.jpg";
  img_ura.onload = function() {
    tex_ura = configureTexture(img_ura);
  }

  img_nep = new Image();
  img_nep.src = "./textures/neptunemap.jpg";
  img_nep.onload = function() {
    tex_nep = configureTexture(img_nep);
  }

  img_plu = new Image();
  img_plu.src = "./textures/plutomap.jpg";
  img_plu.onload = function() {
    tex_plu = configureTexture(img_plu);
  }

  // img_plu = new Image();
  // img_plu.src = "./textures/white.jpg";
  // console.log(img_plu.src);
  // img_plu.onload = function() {
  //   tex_wht = configureTexture(img_plu);
  //   console.log("asdasdasd ");
  // }

  // tex_wht  = gl.createTexture();
  // gl.bindTexture(gl.TEXTURE_2D, tex_wht);
  // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1, 1, 1, 1]));

	gl.enable(gl.DEPTH_TEST);
  render();
}

// -- The orbit angles
var cubeAngle=0,mercOrbAng=0,venOrbAng=0,earOrbAng=0,marOrbAng=0;
var jupOrbAng=0,satOrbAng=0,uraOrbAng=0,nepOrbAng=0,pluOrbAng=0;

// -- The rotation/spin angles.
var mercRotAng=0,venRotAng=0,earRotAng=0,marRotAng=0,jupRotAng=0;
var satRotAng=0,uraRotAng=0,nepRotAng=0,pluRotAng=0;

function render() {
  gl.uniform1f(bool_drawingOrbitPathlocation, 0.0);
  sendBuffer(tri_verts);
  var rot, transl, M_cube, M_tetra, M, M_cam, M_proj, scale;
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  getValuesFromSliders();
  coolFactsMessage();

  /* ----- Camera matrix and transformations ----- */
  M_cam = setCamMatrix();
  gl.uniformMatrix4fv(M_camera, false, flatten(M_cam));

  /* ----- Perspective project matrix ----- */
  M_proj = setProjectionMatrix();
  gl.uniformMatrix4fv(M_project, false, flatten(M_proj));

  /* ----- Draw da planets ----- */
  gl.disableVertexAttribArray(vColor);
  gl.vertexAttrib4f(vColor, 1, 1, 1, 1);

  gl.uniform1f(bool_drawingSunLocation, 1.0);
  drawSun();
  gl.uniform1f(bool_drawingSunLocation, 0.0);
  drawMercury();
  drawVenus();
  drawEarth();
  drawMars();
  drawJupiter();
  drawSaturn();
  drawUranus();
  drawNeptune();
  drawPluto();

  gl.uniform1f(bool_drawingOrbitPathlocation, 1.0);
  drawOrbPaths();

  if (locked_framerate) {
    // -- frame rate is locked at 75fps
    setTimeout(function() {
      requestAnimationFrame(render);
    }, 1000 / 75);
  } else {
    requestAnimFrame( render );
  }

}


function drawOrbPaths() {
  sendBuffers(OrbitPathPoints, orbitPathColors);
  gl.disableVertexAttribArray(vTexCoord);
  gl.bindTexture( gl.TEXTURE_2D, tex_plu);

 // MERCURY
 drawOrbitPath(scale4x4(40, 0.0, 40));
 // VENUS
 drawOrbitPath(scale4x4(80, 0.0, 80));
 // EARTH
 drawOrbitPath(scale4x4(120, 0.0, 120));
 // MARS
 drawOrbitPath(scale4x4(160, 0.0, 160));
 // JUPITER
 drawOrbitPath(scale4x4(200, 0.0, 200));
 // SATURN
 drawOrbitPath(scale4x4(260, 0.0, 260));
 // URANUS
 drawOrbitPath(scale4x4(300, 0.0, 300));
 // NEPTUNE
 drawOrbitPath(scale4x4(340, 0.0, 340));
 // PLUTO
 drawOrbitPath(scale4x4(360, 0.0, 360));

 gl.enableVertexAttribArray(vTexCoord);
}

function drawOrbitPath(scale) {
  gl.uniformMatrix4fv(M_Loc, false, flatten(scale));
  gl.drawArrays(gl.LINE_LOOP, 0, OrbitPathPoints.length);
}

function createOrbitPathVerts() {
  OrbitPathPoints = [];
  orbitPathColors = [];
  // //var center = vec4(0,0,0,1);
  var r = 0.5;
  // //OrbitPathPoints.push(center);
  // //orbitPathColors.push(vec4(1.0,1.0,1.0,1.0));
  for (i = 0; i < 1000; i++) {
    OrbitPathPoints.push(vec4( r*Math.cos(i*2*Math.PI/200), 0.0, r*Math.sin(i*2*Math.PI/200), 1.0));
    orbitPathColors.push(vec4(1.0,1.0,1.0,1.0));
  }
}


function sendBuffers(vArray, cArray) {
	// Replace the old vertex buffer with the new one.
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vArray), gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

  // Replace the old color buffer with the new one.
	var colorBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuff);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(cArray), gl.STATIC_DRAW);
	vColor = gl.getAttribLocation( program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
}

function sendBuffer(vArray) {
  var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vArray), gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
}

function changeView(state) {
  render_mode = state;
  switch (render_mode) {
    case RenderMode.MERCURY: fov = 5.0; break;
    case RenderMode.VENUS: fov = 5.0; break;
    case RenderMode.EARTH: fov = 5.0; break;
    case RenderMode.MARS: fov = 5.0; break;
    case RenderMode.JUPITER: fov = 15.0; break;
    case RenderMode.SATURN: fov = 15.0; break;
    case RenderMode.URANUS: fov = 5.0; break;
    case RenderMode.NEPTUNE: fov = 5.0; break;
    case RenderMode.PLUTO: fov = 1.0; break;
    default: fov = 45.0; break;
  }
  document.getElementById('fov').value = fov;
}

function setCamMatrix() {
  var M_id = identity4x4();
  var cam_pos;
  var up_vec;

  if (render_mode == RenderMode.TOP) {
    cam_pos = vec4(0.0, 500.0, 0.0, 1);
    up_vec = vec4(0, 0, 1, 1);
  } else if (render_mode == RenderMode.SIDE) {
    cam_pos = vec4(0.0, 500.0, 500.0, 1);
    up_vec = vec4(0, 1, 0, 1);
  } else {
    var orbit, trans;
    cam_pos = vec4(1.0, 1.0, 1.0, 1);
    up_vec = vec4(0, 1, 0, 1);

    switch(render_mode) {
      case RenderMode.SUN:
      break;
      case RenderMode.MERCURY:
        orbit = rotation4x4(mercOrbAng, 'y');
        trans = transl4x4(20, 0.0, 0.0);
      break;
      case RenderMode.VENUS:
        orbit = rotation4x4(venOrbAng, 'y');
        trans = transl4x4(40, 0.0, 0.0);
      break;
      case RenderMode.EARTH:
        orbit = rotation4x4(earOrbAng, 'y');
        trans = transl4x4(60, 0.0, 0.0);
      break;
      case RenderMode.MARS:
        orbit = rotation4x4(marOrbAng, 'y');
        trans = transl4x4(80, 0.0, 0.0);
      break;
      case RenderMode.JUPITER:
        orbit = rotation4x4(jupOrbAng, 'y');
        trans = transl4x4(100, 0.0, 0.0);
      break;
      case RenderMode.SATURN:
        orbit = rotation4x4(satOrbAng, 'y');
        trans = transl4x4(130, 0.0, 0.0);
      break;
      case RenderMode.URANUS:
        orbit = rotation4x4(uraOrbAng, 'y');
        trans = transl4x4(150, 0.0, 0.0);
      break;
      case RenderMode.NEPTUNE:
        orbit = rotation4x4(nepOrbAng, 'y');
        trans = transl4x4(170, 0.0, 0.0);
      break;
      case RenderMode.PLUTO:
        orbit = rotation4x4(pluOrbAng, 'y');
        trans = transl4x4(180, 0.0, 0.0);
      break;
    }

    var scale = scale4x4(1.0,1.0, 1.0, 1.0);
    var spin = rotation4x4(earRotAng, 'y');

    var trans_orbt = matMult(orbit, trans);
    var scale_spin = matMult(spin, scale);

    var M_Model = matMult(trans_orbt, scale_spin);

    // -- center of star, looking at earth. Rotation
    //cam_pos = matVecMult(orbit, cam_pos);
    // -- stationary on orbit path. Planet flies by.

    //-- Is the best way to do it
    cam_pos = matVecMult(trans, cam_pos);
    cam_pos = matVecMult(matMult(trans, orbit), cam_pos);

    var lookAt = matVecMult(trans_orbt, vec4(0,0,0,1));

    gl.uniform4fv(viewWorldPositionLocation, cam_pos);

    up_vec = matVecMult(M_id, up_vec);
    return camlookAt(vec3(cam_pos[0],cam_pos[1],cam_pos[2]), vec3(lookAt[0],lookAt[1],lookAt[2]), vec3(up_vec[0], up_vec[1], up_vec[2]));
  }

  gl.uniform4fv(viewWorldPositionLocation, cam_pos);
  up_vec =  matVecMult(M_id, up_vec);
  return camlookAt(vec3(cam_pos[0],cam_pos[1],cam_pos[2]), vec3(0,0,0), vec3(up_vec[0], up_vec[1], up_vec[2]));
}

function setProjectionMatrix() {
  var aspect = (ortho_right - ortho_left) / (ortho_top - ortho_bottom);
  var near = 0.1;
  var far = 10000.0;

  switch (render_mode) {
    case RenderMode.MERCURY: near = 10.0;
      break;
    case RenderMode.VENUS: near = 10.0;
      break;
    case RenderMode.EARTH: near = 10.0;
      break;
    case RenderMode.MARS: near = 10.0;
      break;
    case RenderMode.JUPITER: near = 10.0;
      break;
    case RenderMode.SATURN: near = 10.0;
      break;
    case RenderMode.URANUS: near = 140.0;
      break;
    case RenderMode.NEPTUNE: near = 140.0;
      break;
    case RenderMode.PLUTO: near = 170.0;
      break;
  }

  return perspective_p(fov, aspect, near, far);
}



function tetrahedron(vertA, vertB, vertC, vertD, n) {
  divideTriangle(vertA, vertB, vertC, n);
  divideTriangle(vertD, vertC, vertB, n);
  divideTriangle(vertA, vertD, vertB, n);
  divideTriangle(vertA, vertC, vertD, n);
}

function divideTriangle(a, b, c, count) {

  if (count >  0) {
    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);

  } else {
    triangle(a,b,c);
  }
}

function triangle(a, b, c) {
  // push them onto the verts array
  var p1 = vec3(a[0], a[1], a[2]);
  var p2 = vec3(b[0], b[1], b[2]);
  var p3 = vec3(c[0], c[1], c[2]);

  // add the normals
  normalsArray.push(p1);
  normalsArray.push(p2);
  normalsArray.push(p3);

  tri_verts.push(p1);
  tri_verts.push(p2);
  tri_verts.push(p3);

  tri_colors.push(vec4(1.0,0.0,0.0,1.0));
  tri_colors.push(vec4(0.0,1.0,0.0,1.0));
  tri_colors.push(vec4(0.0,0.0,1.0,1.0));
}

function drawSun() {
  var rot = rotation4x4(earRotAng, 'y');
  var scale = scale4x4(10.9,10.9,10.9, 1.0); //var scale = scale4x4(109,109,109, 1.0);
  var M_Model = matMult(rot, scale);
  var inverseTrans = matMult(rotation4x4(-earRotAng, 'y'), scale);

  gl.uniformMatrix4fv(M_Loc, false, flatten(M_Model));
  gl.uniformMatrix4fv(M_worldInverse, false, flatten(inverseTrans));
  gl.bindTexture( gl.TEXTURE_2D, tex_sun);
  gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length);
}


function drawPlanet(spin, orbit, scale, trans, rotAngle, texture) {
  var scale_spin = matMult(spin, scale);
  var trans_orbt = matMult(orbit, trans);
  var M_Model = matMult(trans_orbt, scale_spin);
  var inverseTrans = matMult(trans_orbt, matMult(rotation4x4(-rotAngle, 'y'), scale));

  gl.uniformMatrix4fv(M_worldInverse, false, flatten(inverseTrans));
  gl.uniformMatrix4fv(M_Loc, false, flatten(M_Model));
  gl.bindTexture( gl.TEXTURE_2D, texture);
  gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length);
}


function drawMercury() {
  drawPlanet(rotation4x4(mercRotAng, 'y'), rotation4x4(mercOrbAng, 'y'), scale4x4(0.383,0.383, 0.383, 1.0), transl4x4(20, 0.0, 0.0), mercRotAng, tex_mer);
  var nextOrbAngle = (mercOrbAng + 1.59);
  var nextRotAngle = (mercRotAng + 0.017);
  mercRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  mercOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

function drawVenus() {
  drawPlanet(rotation4x4(venRotAng, 'y'), rotation4x4(venOrbAng, 'y'), scale4x4(0.949,0.949, 0.949, 1.0), transl4x4(40, 0.0, 0.0), venRotAng, tex_ven);
  var nextRotAngle = (venRotAng + 0.009);
  var nextOrbAngle = (venOrbAng + 1.18);
  venRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  venOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

function drawEarth() {
  drawPlanet(rotation4x4(earRotAng, 'y'), rotation4x4(earOrbAng, 'y'), scale4x4(1.0,1.0, 1.0, 1.0), transl4x4(60, 0.0, 0.0), earRotAng, tex_ear);
  var nextAngle = (earRotAng + 1);
  earRotAng = (nextAngle >= 360) ? nextAngle - 360 : nextAngle;
  earOrbAng = (nextAngle >= 360) ? nextAngle - 360 : nextAngle;
}

function drawMars() {
  drawPlanet(rotation4x4(marRotAng, 'y'), rotation4x4(marOrbAng, 'y'), scale4x4(0.532, 0.532, 0.532, 1.0), transl4x4(80, 0.0, 0.0), marRotAng, tex_mar);
  var nextRotAngle = (marRotAng + 1.03);
  var nextOrbAngle = (marOrbAng + 0.808);
  marRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  marOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

function drawJupiter() {
  drawPlanet(rotation4x4(jupRotAng, 'y'), rotation4x4(jupOrbAng, 'y'), scale4x4(11.21, 11.21, 11.21, 1.0), transl4x4(100, 0.0, 0.0), jupRotAng, tex_jup);
  var nextRotAngle = (jupRotAng + 0.414);
  var nextOrbAngle = (jupOrbAng + 0.439);
  jupRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  jupOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

function drawSaturn() {
  drawPlanet(rotation4x4(satRotAng, 'y'), rotation4x4(satOrbAng, 'y'), scale4x4(9.45, 9.45, 9.45, 1.0), transl4x4(130, 0.0, 0.0), satRotAng, tex_sat);
  var nextRotAngle = (satRotAng + 0.445);
  var nextOrbAngle = (satOrbAng + 0.325);
  satRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  satOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

function drawUranus() {
  drawPlanet(rotation4x4(uraRotAng, 'y'), rotation4x4(uraOrbAng, 'y'), scale4x4(4.01, 4.01, 4.01, 1.0), transl4x4(150, 0.0, 0.0), uraRotAng, tex_ura);
  var nextRotAngle = (uraRotAng + 0.708);
  var nextOrbAngle = (uraOrbAng + 0.288);
  uraRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  uraOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

function drawNeptune() {
  drawPlanet(rotation4x4(nepRotAng, 'y'), rotation4x4(nepOrbAng, 'y'), scale4x4(3.88, 3.88, 3.88, 1.0), transl4x4(170, 0.0, 0.0), nepRotAng, tex_nep);
  var nextRotAngle = (nepRotAng + 0.673);
  var nextOrbAngle = (nepOrbAng + 0.182);
  nepRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  nepOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

function drawPluto() {
  drawPlanet(rotation4x4(pluRotAng, 'y'), rotation4x4(pluOrbAng, 'y'), scale4x4(0.186, 0.186, 0.186, 1.0), transl4x4(180, 0.0, 0.0), pluRotAng, tex_plu);
  var nextRotAngle = (pluRotAng + 6.41);
  var nextOrbAngle = (pluOrbAng + 0.157);
  pluRotAng = (nextRotAngle >= 360) ? nextRotAngle - 360 : nextRotAngle;
  pluOrbAng = (nextOrbAngle >= 360) ? nextOrbAngle - 360 : nextOrbAngle;
}

var ortho_left, ortho_right, ortho_bottom, ortho_top;
var win_width, win_height, fov;
function getValuesFromSliders() {
  fov = parseFloat(document.getElementById('fov').value);
  ortho_left = -(2.0);
  ortho_right = 2.0;
  ortho_bottom = -(2.0);
  ortho_top = 2.0;
  locked_framerate = document.getElementById('frameLock').checked;

}


function drawSphere() {
  var va = vec4(0.0,0.0, 1.0, 1.0);
  var vb = vec4(0.0, 0.942809, -0.333333, 1.0);
  var vc = vec4(-0.816497,-0.471405, -0.333333, 1.0);
  var vd = vec4(0.816497,-0.471405,-0.333333, 1.0);
  tetrahedron(va, vb, vc, vd, 5);
}

// -- Create the texture coords to be used for each planet.
function mapSphereTexture() {
  var u, v;
  for (var i = 0; i < tri_verts.length; i++) {
    u = 0.5 - (Math.atan2(tri_verts[i][2], tri_verts[i][0])) / (2 * Math.PI);
    v = 0.5 - (Math.asin(tri_verts[i][1])) / (Math.PI);
    tri_tcoords.push(vec2(u, v));
  }
}

// -- This was an attempt to make the texture of the orbit paths anything other than black.
function mapOrbTexture() {
  tri_tcoords = [];
  for (var i = 0; i < OrbitPathPoints.length; i++) {
    tri_tcoords.push(vec2(0,0));
  }
  var tBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_tcoords), gl.STATIC_DRAW );
  vTexCoord = vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
  gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray(vTexCoord);
}

// -- This is the backup strategy for the orbit path color issue.
var showPaths = false;
function pathsState() {
  var checkBox = document.getElementById("myCheck");
  showPaths = checkBox.checked;

  if (showPaths) {
    gl.clearColor( 0.12157, 0.0, 0.21176, 1.0 );
  } else {
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
  }
}

function coolFactsMessage() {
  var fact = "Click on a planet button to learn \"cool facts\" about it, and get a closer look";

  switch (render_mode) {
    case RenderMode.MERCURY:
      fact = "-- Has no sense of personal space.\n-- Snuggling up close to the hottest body in the system";
      break;
    case RenderMode.VENUS:
      fact = "-- This is where women are from. Elon, when you gonna take me here?";
      break;
    case RenderMode.EARTH:
      fact = "-- Most deadly place in the universe. \n-- Some people think it's flat.";
      break;
    case RenderMode.MARS:
      fact = "-- A one way trip..\n-- Matt Damon survived here. I guess Botany is not useless degree after all.";
      break;
    case RenderMode.JUPITER:
      fact = "-- THICC";
      break;
    case RenderMode.SATURN:
      fact = "-- Beyonce's favorite planet!";
      break;
    case RenderMode.URANUS:
      fact = "-- I refuse to say the name of this planet out loud.\n-- Stop laughing!";
      break;
    case RenderMode.NEPTUNE:
      fact = "Yo listen up, here's the story\nAbout a little guy that lives in a blue world\nAnd all day and all night and everything he sees is just blue\n";
      fact += "Like him, inside and outside\nBlue his house with a blue little window\nAnd a blue Corvette\nAnd everything is blue for him\n";
      fact += "And himself and everybody around\n'Cause he ain't got nobody to listen\n\nI'm blue da ba dee da ba daa";
      break;
    case RenderMode.PLUTO:
      fact = "-- Is a Micky Mouse's favorite Dog.\n-- Doesn't deserve to be here.\n-- It's that friend you invite to the party because your parents made you.";
      break;
  }

  document.getElementById("text-box").value = fact;
}


// -- This... was an attempt.... to make the dang orbit paths white
function switchToLineShader() {
  gl.detachShader(program, fragmentShader);
  gl.detachShader(program, vertexShader);

  gl.attachShader(program, vertexShader2);
  gl.attachShader(program, fragmentShader2);
}
// -- Same here....
function switchToPlanetShader() {
  gl.detachShader(program, fragmentShader2);
  gl.detachShader(program, vertexShader2);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
}

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

	return texture;
}


// function that does all shader initializations and
// returns the compiled shader program
function createShaders () {
  // Create program object
  program = gl.createProgram();

  //  Load vertex shader
  vertexShader = gl.createShader(gl.VERTEX_SHADER);
  vertexShader2 = gl.createShader(gl.VERTEX_SHADER);

  gl.shaderSource(vertexShader, myVertexShader);
  gl.shaderSource(vertexShader2, OrbitPathVertexShader);

  gl.compileShader(vertexShader);
  gl.compileShader(vertexShader2);

  gl.attachShader(program, vertexShader);
  compiled = gl.getShaderParameter(vertexShader2, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error(gl.getShaderInfoLog(vertexShader2));
  }

  //  Load fragment shader
  fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  fragmentShader2 = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(fragmentShader, myFragmentShader);
  gl.shaderSource(fragmentShader2, OrbitPathFragShader);

  gl.compileShader(fragmentShader);
  gl.compileShader(fragmentShader2);

  gl.attachShader(program, fragmentShader);
  compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!compiled) {
    console.error(gl.getShaderInfoLog(fragmentShader));
  }

  //  Link program
  gl.linkProgram(program);
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    console.error(gl.getProgramInfoLog(program));
  }

	return program;
}
