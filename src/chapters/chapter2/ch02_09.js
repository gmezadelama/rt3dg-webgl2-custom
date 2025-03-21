"use strict";

let gl,
  program,
  parts = [],
  projectionMatrix = mat4.create(),
  modelViewMatrix = mat4.create();

async function initProgram() {
  [gl, program] = await initializeShaders(gl, 2, 9);

  gl.useProgram(program);

  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
}

// Unlike before where we returned a single Promise,
// we are simply firing off many `fetch` requests. If required,
// you could employ various techniques to determine whether a series of
// promises have resolved. Additionally, Promise libraries such as `Bluebird`
// can handle such operations with ease
function load() {
  // There are 179 parts for this particular model.
  // There are many ways to configure an architecture where we don't have to hard-code
  // these values, but we've decided to keep these as simple and low-level as possible
  // for education purposes.
  for (let i = 1; i < 179; i++) {
    fetch(`../../common/assets/images/models/nissan-gtr/part${i}.json`)
      .then((res) => res.json())
      .then((data) => {
        // Create a VAO
        const vao = gl.createVertexArray();

        // Bind VAO
        gl.bindVertexArray(vao);

        // VBO
        const vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(data.vertices),
          gl.STATIC_DRAW
        );

        // Configure instructions
        gl.enableVertexAttribArray(program.aVertexPosition);
        gl.vertexAttribPointer(
          program.aVertexPosition,
          3,
          gl.FLOAT,
          false,
          0,
          0
        );

        // IBO
        const indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        gl.bufferData(
          gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(data.indices),
          gl.STATIC_DRAW
        );

        // Attach them for later access
        data.vao = vao;
        data.ibo = indexBufferObject;

        // Push data onto parts array
        parts.push(data);

        // Clean
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      })
      .catch(console.error);
  }
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // We will discuss these operations in later chapters
  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    10,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [-10, 0, -100]);
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    (30 * Math.PI) / 180,
    [1, 0, 0]
  );
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    (30 * Math.PI) / 180,
    [0, 1, 0]
  );

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);

  // Iterate over every part inside of the `parts` array
  parts.forEach((part) => {
    // Bind
    gl.bindVertexArray(part.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.ibo);

    // Draw
    gl.drawElements(gl.LINES, part.indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
}

function render() {
  requestAnimationFrame(render);
  draw();
}

async function init() {
  const canvas = utils.getCanvas("webgl-canvas");
  // Handle automatic resizing
  utils.autoResizeCanvas(canvas);

  // Retrieve a valid WebGL2 context
  gl = utils.getGLContext(canvas);
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  await initProgram();
  // We are no longer blocking the render until `load` has resolved,
  // as we're not returning a Promise.
  load();
  render();
}

window.onload = init;
