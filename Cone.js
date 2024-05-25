// point class that holds point values
class Cone {
  constructor(matrix, segments, color) {
    this.type = 'cone';
    this.color = color;
    this.segments = segments;
    this.matrix = matrix
  }

  render() {
    var rgba = this.color;
    var segments = this.segments

    // pass texture number
    gl.uniform1i(u_WhichTexture, -2);

    // Pass color to shader
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass matrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Draw
    var d = 1 // delta

    let angleStep = 360/segments;
    for (var angle = 0; angle < 360; angle += angleStep) {
      let center = [0, 0];
      let angle1 = angle;
      let angle2 = angle + angleStep;
      let v1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
      let v2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];

      let pt1 = [center[0]+v1[0], center[1]+v1[1]];
      let pt2 = [center[0]+v2[0], center[1]+v2[1]];

      drawTriangle3D([0, 0, 0,  pt1[0], 0, pt1[1],  pt2[0], 0, pt2[1]]);
      drawTriangle3D([pt1[0], 0, pt1[1], pt2[0], 0, pt2[1], 0, d, 0]);
    }

  }
}