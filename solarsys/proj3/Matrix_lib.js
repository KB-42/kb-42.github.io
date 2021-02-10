/* Author: Jacob Denton
 * For: ITCS-3120
 * Date: 10-01-19, 10-21-19, 11-5-19
 */

function identity3x3() {
	var matrx = [
		vec3(1.0, 0.0, 0.0),
		vec3(0.0, 1.0, 0.0),
		vec3(0.0, 0.0, 1.0)
	];

	return matrx;
}


function identity4x4() {

	var result = [
		vec4(1.0, 0.0, 0.0, 0.0),
		vec4(0.0, 1.0, 0.0, 0.0),
		vec4(0.0, 0.0, 1.0, 0.0),
		vec4(0.0, 0.0, 0.0, 1.0)
	];
	return result;
}


function transl3x3(tx, ty, point) {
	var idMtrx = identity3x3(); // -- Grab an identity matrix

	// -- Implementing row major form.
	idMtrx[2] = vec3(tx, ty, 1); // -- We add the translation factors to the identity matrix
	// -- vector/matrix multiplication.
	var result = matMult(idMtrx, point);

	return result;
}


function transl4x4 (tx, ty, tz) {
	var idMtrx = identity4x4();

	idMtrx[3] = vec4(tx, ty, tz, 1.0);

	return idMtrx;
}


function rotate3x3(angle, point) {
	var idMtrx = identity3x3();
	var theta = radians(angle);

	// Determine our cos sin -sin.
	var cos = Math.cos(theta);
	var sin = Math.sin(theta);
	var msin = -(Math.sin(theta));

	// -- put them in the identity matrix. Row major form.
	idMtrx[0] = vec3(cos, sin, 0.0);
	idMtrx[1] = vec3(msin, cos, 0.0);

	// -- multiply the matrices.
	var result = matMult(idMtrx, point);

	return result;
}


function rotation4x4(angle, axis) {
	var idMtrx = identity4x4();

	var theta = (radians(angle));
	var cos = Math.cos(theta);
	var sin = Math.sin(theta);
	var msin = -(Math.sin(theta));

	switch (axis) {
		case 'x':
		case 'X':
			idMtrx[1] = vec4(0.0, cos, sin, 0.0);
			idMtrx[2] = vec4(0.0, msin, cos, 0.0);
		break;
		case 'y':
		case 'Y':
		idMtrx[0] = vec4(cos, 0.0, msin, 0.0);
		idMtrx[2] = vec4(sin, 0.0, cos, 0.0);
		break;
		case 'z':
		case 'Z':
		idMtrx[0] = vec4(cos, sin, 0.0, 0.0);
		idMtrx[1] = vec4(msin, cos, 0.0, 0.0);
		break;
	}

	return idMtrx;
}


function scale3x3 (sx, sy, point) {
	var idMtrx = identity3x3();

	// -- put the scale factors into the identity matrix.
	idMtrx[0] = vec3(sx, 0.0, 0.0);
	idMtrx[1] = vec3(0.0, sy, 0.0);

	// -- multiply the matrices. Similar to transl3x3()
	var result = matMult(idMtrx, point);

	return result;
}


function scale4x4 (sx, sy, sz) {
	var idMtrx = identity4x4();

	idMtrx[0] = vec4(sx, 0.0, 0.0, 0.0);
	idMtrx[1] = vec4(0.0, sy, 0.0, 0.0);
	idMtrx[2] = vec4(0.0, 0.0, sz, 0.0);

	return idMtrx;
}


function matVecMult(M, V) {
	var result;

	if (M[0].length != V.length) { // rows need to be equal to column.
		throw "Size bad";
	}


	if (M.length == 3) {

		result = [
			dot(V, vec3(M[0][0], M[1][0], M[2][0])),
			dot(V, vec3(M[0][1], M[1][1], M[2][1])),
			dot(V, vec3(M[0][2], M[1][2], M[2][2]))
		];

	} else if (M.length == 4) {
		result = [
			dot(V, vec4(M[0][0], M[1][0], M[2][0], M[3][0])),
			dot(V, vec4(M[0][1], M[1][1], M[2][1], M[3][1])),
			dot(V, vec4(M[0][2], M[1][2], M[2][2], M[3][2])),
			dot(V, vec4(M[0][3], M[1][3], M[2][3], M[3][3]))
		];
	}

	return result;
}



function matMult (M1, M2) {
	var result = [];
	if (M2[0].length != M1.length) { // rows need to be equal to column.
		throw "Size bad";
	}

	var mVM; // holds the result of the dot product of a row and column.
	var build_row; // used to build each row of the result.

	for (var row = 0; row < M2.length; row++) {
		mVM = matVecMult(M1, M2[row]);

		build_row = vec4(mVM[0], mVM[1], mVM[2], mVM[3]);

		result.push(build_row);
	}

	return result;
}


// -- Camera and perspect related:

function orthographical( left, right, bottom, top, near, far ) {


	var widthRatio  = 1.0 / (right - left);
	var heightRatio = 1.0 / (top - bottom);
	var depthRatio  = 1.0 / (far - near);

	var sx = 2 * widthRatio;
	var sy = 2 * heightRatio;
	var sz = -2 * depthRatio;

	var tx = -(right + left) * widthRatio;
	var ty = -(top + bottom) * heightRatio;
	var tz = -(far + near) * depthRatio;

	var M = identity4x4();

	M[0] = sx;  M[4] = 0;   M[8] = 0;   M[12] = tx;
  M[1] = 0;   M[5] = sy;  M[9] = 0;   M[13] = ty;
  M[2] = 0;   M[6] = 0;   M[10] = sz; M[14] = tz;
  M[3] = 0;   M[7] = 0;   M[11] = 0;  M[15] = 1;

  return M;
}


function perspective_p(fovy, aspect, near, far) {
	var M = identity4x4();

  if (fovy <= 0 || fovy >= 180 || aspect <= 0 || near >= far || near <= 0) {
    console.log('Invalid parameters to createPerspective');
    return M;
  } else {

    var half_fovy = radians(fovy) / 2;
    var top = near * Math.tan(half_fovy);
    var bottom = -top;
    var right = top * aspect;
    var left = -right;

		// -- Using a frustrum creation appoach
		if (left === right || bottom === top || near === far) {
	    console.log("parameters bad: DIVIDE BY ZERO");
	    return M;
	  }

		var sx = 2 * near / (right - left);
		var sy = 2 * near / (top - bottom);

		var c2 = - (far + near) / (far - near);
		var c1 = 2 * near * far / (near - far);

		var tx = -near * (left + right) / (right - left);
		var ty = -near * (bottom + top) / (top - bottom);

		M[0] = sx; M[4] = 0;  M[8] = 0;    M[12] = tx;
		M[1] = 0;  M[5] = sy; M[9] = 0;    M[13] = ty;
		M[2] = 0;  M[6] = 0;  M[10] = c2;  M[14] = c1;
		M[3] = 0;  M[7] = 0;  M[11] = -1;  M[15] = 0;
  }

  return M;
}


function camlookAt(eye, look, up) {

 	var M = identity4x4();

 	var n = subtract(eye, look);
 	var n = normalize(n);

	var u = cross(up, n);
	u = normalize(u);

	var v = cross(n,u);
	v = normalize(v);

  var tx = - dot(u,eye);
  var ty = - dot(v,eye);
  var tz = - dot(n,eye);

  //-- Set the camera matrix
  M[0] = u[0];  M[4] = u[1];  M[8]  = u[2];  M[12] = tx;
  M[1] = v[0];  M[5] = v[1];  M[9]  = v[2];  M[13] = ty;
  M[2] = n[0];  M[6] = n[1];  M[10] = n[2];  M[14] = tz;
  M[3] = 0;     M[7] = 0;     M[11] = 0;     M[15] = 1;

	return M;
}


function transpose4x4_r(m) {
	var result = [];

	result.push ([m[0][0], m[1][0], m[2][0], m[3][0]]);
	result.push ([m[0][1], m[1][1], m[2][1], m[3][1]]);
	result.push ([m[0][2], m[1][2], m[2][2], m[3][2]]);
	result.push ([m[0][3], m[1][3], m[2][3], m[3][3]]);

	return result;
}


function subtract_d (u, v) {

	var result = [];

	for ( var i = 0; i < u.length; ++i ) {
			if ( u[i].length != v[i].length ) {
					throw "subtract(): trying to subtact matrices" +
							" of different dimensions";
			}
			result.push( [] );
			for ( var j = 0; j < u[i].length; ++j ) {
					result[i].push( u[i][j] - v[i][j] );
			}
	}
	return result;
}
