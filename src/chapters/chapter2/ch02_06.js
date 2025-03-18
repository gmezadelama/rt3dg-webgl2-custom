"use strict";

let gl,
  program,
  indices,
  coneVAO,
  coneIndexBuffer,
  projectionMatrix = mat4.create(),
  modelViewMatrix = mat4.create();

async function initProgram() {
  [gl, program] = await initializeShaders(gl, 2, 6);

  gl.useProgram(program);

  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
}

function initBuffers() {
  const vertices = [
    1.5, 0, 0, -1.5, 1, 0, -1.5, 0.809017, 0.587785, -1.5, 0.309017, 0.951057,
    -1.5, -0.309017, 0.951057, -1.5, -0.809017, 0.587785, -1.5, -1, 0, -1.5,
    -0.809017, -0.587785, -1.5, -0.309017, -0.951057, -1.5, 0.309017, -0.951057,
    -1.5, 0.809017, -0.587785,
  ];

  indices = [
    0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7, 0, 7, 8, 0, 8, 9, 0,
    9, 10, 0, 10, 1,
  ];

  // Create VAO
  coneVAO = gl.createVertexArray();

  // Bind VAO
  gl.bindVertexArray(coneVAO);

  const coneVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // Configure instructions for VAO
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  coneIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Clean
  gl.bindVertexArray(null);
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // We will discuss these operations in later chapters
  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);

  // Bind
  gl.bindVertexArray(coneVAO);

  gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);

  // Clean
  gl.bindVertexArray(null);
}

// Although we don't necessarily need to call `draw` on every
// rendering cycle in this example, we will soon cover why this is important
function render() {
  requestAnimationFrame(render);
  draw();
}

async function init() {
  const canvas = utils.getCanvas("webgl-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gl = utils.getGLContext(canvas);
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  await initProgram();
  initBuffers();
  render();
}

window.onload = init;
