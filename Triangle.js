// triangle class that holds point values
class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // Pass color to shader
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass shape size to shader
    gl.uniform1f(u_Size, size)
    // Draw
    var d = this.size/200.0; // delta value for size
    drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
  }

  
}

// global buffers
g_vertexBuffer = null;
g_uvBuffer = null;
g_shadingBuffer = null;
g_normalBuffer = null;

function initTriangles3DUV() {

  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log('Failed to create buffer object');
    return -1;
  }

  // ----------------

  // create UV buffer
  g_uvBuffer = gl.createBuffer();
  if (!g_uvBuffer) {
    console.log("Failed to create buffer object");
    return -1;
  }

  g_normalBuffer = gl.createBuffer();
  if (!g_normalBuffer) {
    console.log("Failed to create buffer object");
    return -1;
  }

}

function drawTriangle3D(vertices) {
  var n = 3; // # of verts

  // create buffer
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create buffer object");
    return -1;
  }

  // Bind the biffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
  var n = vertices.length / 3; // # of verts

  // create vertex buffer
  if (g_vertexBuffer == null || g_uvBuffer == null) {
    initTriangles3DUV();
  }


  // Bind the biffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_UV variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_UV variable
  gl.enableVertexAttribArray(a_UV);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUVNormal(vertices, uv, normals) {
  var n = vertices.length / 3; // # of verts

  // create vertex buffer
  if (g_vertexBuffer == null || g_uvBuffer == null || g_normalBuffer == null) {
    initTriangles3DUV();
  }

  // position ----------------------------------------------
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // uv ------------------------------------------------------
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_UV variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_UV variable
  gl.enableVertexAttribArray(a_UV);

  // noramls --------------------------------------------------------
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);

  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_UV variable
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_UV variable
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}