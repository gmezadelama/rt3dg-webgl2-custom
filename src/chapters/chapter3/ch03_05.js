"use strict";

let gl,
  program,
  vao,
  indices,
  indicesBuffer,
  modelViewMatrix = mat4.create(),
  projectionMatrix = mat4.create(),
  normalMatrix = mat4.create();

async function initProgram() {
  // Configure `canvas`
  const canvas = utils.getCanvas("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  // Configure `gl`
  gl = utils.getGLContext(canvas);
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clearDepth(100);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  [gl, program] = await initializeShaders(gl, 3, 5);

  gl.useProgram(program);

  // Set locations onto `program` instance
  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.aVertexNormal = gl.getAttribLocation(program, "aVertexNormal");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
  program.uLightAmbient = gl.getUniformLocation(program, "uLightAmbient");
  program.uLightDiffuse = gl.getUniformLocation(program, "uLightDiffuse");
  program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
}

// Configure lights
function initLights() {
  gl.uniform3fv(program.uLightDirection, [0, 0, -1]);
  gl.uniform4fv(program.uLightAmbient, [0.01, 0.01, 0.01, 1]);
  gl.uniform4fv(program.uLightDiffuse, [0.5, 0.5, 0.5, 1]);
  gl.uniform4f(program.uMaterialDiffuse, 0.1, 0.5, 0.8, 1);
}

/**
 * This function generates the example data and create the buffers
 *
 *           4          5             6         7
 *           +----------+-------------+---------+
 *           |          |             |         |
 *           |          |             |         |
 *           |          |             |         |
 *           |          |             |         |
 *           |          |             |         |
 *           +----------+-------------+---------+
 *           0          1             2         3
 *
 */
function initBuffers() {
  const vertices = [
    -20,
    -8,
    20, // 0
    -10,
    -8,
    0, // 1
    10,
    -8,
    0, // 2
    20,
    -8,
    20, // 3
    -20,
    8,
    20, // 4
    -10,
    8,
    0, // 5
    10,
    8,
    0, // 6
    20,
    8,
    20, // 7
  ];

  indices = [0, 5, 4, 1, 5, 0, 1, 6, 5, 2, 6, 1, 2, 7, 6, 3, 7, 2];

  // Create VAO
  vao = gl.createVertexArray();

  // Bind Vao
  gl.bindVertexArray(vao);

  const normals = utils.calculateNormals(vertices, indices);

  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // Configure instructions
  gl.enableVertexAttribArray(program.aVertexPosition);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  // Configure instructions
  gl.enableVertexAttribArray(program.aVertexNormal);
  gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Clean
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function draw() {
  const { width, height } = gl.canvas;

  gl.viewport(0, 0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(projectionMatrix, 45, width / height, 0.1, 10000);
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -40]);

  mat4.copy(normalMatrix, modelViewMatrix);
  mat4.invert(normalMatrix, normalMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);

  // We will start using the `try/catch` to capture any errors from our `draw` calls
  try {
    // Bind
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

    // Draw
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  } catch (error) {
    // We catch the `error` and simply output to the screen for testing/debugging purposes
    console.error(error);
  }
}

function render() {
  requestAnimationFrame(render);
  draw();
}

async function init() {
  await initProgram();
  initBuffers();
  initLights();
  render();
}

window.onload = init;
