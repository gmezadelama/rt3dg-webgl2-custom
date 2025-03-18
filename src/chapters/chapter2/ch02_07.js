"use strict";

let gl,
  program,
  model,
  coneVAO,
  modelIndexBuffer,
  projectionMatrix = mat4.create(),
  modelViewMatrix = mat4.create();

async function initProgram() {
  [gl, program] = await initializeShaders(gl, 2, 7);

  gl.useProgram(program);

  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  // Attach a uniform to define the color of our model
  program.uModelColor = gl.getUniformLocation(program, "uModelColor");
}

// Given a path to a file, load the assets asynchronously
function load(filePath) {
  // We return the promise so that, if needed, you can know when `load` has resolved
  return (
    fetch(filePath)
      // Convert to a valid json
      .then((res) => res.json())
      // Handle the parsed JSON data
      .then((data) => {
        // Assign to global variable for later reference
        model = data;

        // Create VAO
        coneVAO = gl.createVertexArray();

        // Bind VAO
        gl.bindVertexArray(coneVAO);

        // Set uniform color
        gl.uniform3fv(program.uModelColor, model.color);

        const modelVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(model.vertices),
          gl.STATIC_DRAW
        );

        // Configure instructions for VAO
        gl.enableVertexAttribArray(program.aVertexPosition);
        gl.vertexAttribPointer(
          program.aVertexPosition,
          3,
          gl.FLOAT,
          false,
          0,
          0
        );

        modelIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBuffer);
        gl.bufferData(
          gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(model.indices),
          gl.STATIC_DRAW
        );

        // Clean
        gl.bindVertexArray(null);
      })
      // Display into the console if there are any errors
      .catch(console.error)
  );
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // We will cover these operations in later chapters
  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5.0]);

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);

  // Bind
  gl.bindVertexArray(coneVAO);

  // Draw
  gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

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
  // We call `load` and since we are returning a Promise,
  // we call `render` after it has resolved
  load("../../../common/assets/images/models/geometries/cone1.json").then(
    render
  );
}

window.onload = init;
