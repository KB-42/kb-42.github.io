
function transl3x3 (tx, ty) {

	var transl_m = identity3();

	transl_m[0][2] = tx;
	transl_m[1][2] = ty;

	return transl_m;
}

function transl4x4 (tx, ty, tz) {

	var transl_m = identity4();

	transl_m[0][3] = tx;
	transl_m[1][3] = ty;
	transl_m[2][3] = tz;

	return transl_m;
}

function rotation3x3 (angle) {

	var rotation_m = identity3();

	var angle_r = angle*Math.PI/180.;
	var c = Math.cos(angle_r);
	var s = Math.sin(angle_r);

	rotation_m[0][0] = c;
	rotation_m[0][1] = -s;
	rotation_m[1][0] = s;
	rotation_m[1][1] = c;

	return rotation_m;
}
function rotation4x4 (angle, axis) {

	var rotation_m = identity4();

	var angle_r = angle*Math.PI/180.;
	var c = Math.cos(angle_r);
	var s = Math.sin(angle_r);

	switch (axis) {
		case 'x':
		case 'X':
			rotation_m[1][1] = c;
			rotation_m[1][2] = -s;
			rotation_m[2][1] = s;
			rotation_m[2][2] = c;
			break;

		case 'y':
		case 'Y':
			rotation_m[0][0] = c;
			rotation_m[0][2] = s;
			rotation_m[2][0] = -s;
			rotation_m[2][2] = c;
			break;

		case 'z':
		case 'Z':
			rotation_m[0][0] = c;
			rotation_m[0][1] = -s;
			rotation_m[1][0] = s;
			rotation_m[1][1] = c;
		break;
	}

	return rotation_m;
}

function scale3x3 (sx, sy) {

	var scale_m = identity3();

	scale_m[0][0] = sx;
	scale_m[1][1] = sy;

	return scale_m;
}

function scale4x4 (sx, sy) {

	var scale_m = identity4();

	scale_m[0][0] = sx;
	scale_m[1][1] = sy;
	scale_m[2][2] = sz;

	return scale_m;
}


function identity3() {
	var m = [];
	m = [
			[1.0, 0.0, 0.0],
			[0.0, 1.0, 0.0],
			[0.0, 0.0, 1.0],
		];

	return m;
}

function identity4() {
	var m = [];
	m = [
			[1.0, 0.0, 0.0, 0.0],
			[0.0, 1.0, 0.0, 0.0],
			[0.0, 0.0, 1.0, 0.0],
			[0.0, 0.0, 0.0, 1.0],
		];

	return m;
}

function dotProduct2d(v1, v2) {
	return [v1[0]*v2[0] + v1[1]*v2[1]];
}
function dotProduct3d(v1, v2) {
	return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

function matVecMult3 (m, v) {
	var result = [];

	result.push (m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2]);
	result.push (m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2]);
	result.push (1.0);

	return result;
}

function matVecMult4 (m, v) {
	var result = [];

	result.push ([m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2] + m[0][3]*v[3]]);
	result.push ([m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2] + m[1][3]*v[3]]);
	result.push ([m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2] + m[2][3]*v[3]]);
	result.push ([m[3][0]*v[0] + m[3][1]*v[1] + m[3][2]*v[2] + m[3][3]*v[3]]);

	return result;
}

function transpose4x4(m) {
	var result = [];

	result.push ([m[0][0], m[1][0], m[2][0], m[3][0]]);
	result.push ([m[0][1], m[1][1], m[2][1], m[3][1]]);
	result.push ([m[0][2], m[1][2], m[2][2], m[3][2]]);
	result.push ([m[0][3], m[1][3], m[2][3], m[3][3]]);

	return result;
}

function matMult4(m1, m2) {
	var result = [];

	for (var i = 0; i < 4; ++i) {
		result.push( [] );

		for (var j = 0; j < 4; ++j ) {
			var sum = 0.0;
			for (var k = 0; k < 4; ++k ) {
				sum += m1[i][k] * m2[k][j];
			}
			result[i].push(sum);
		}
	}

	return result;
}
