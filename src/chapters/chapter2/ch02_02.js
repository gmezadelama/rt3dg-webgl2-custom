"use strict";

// Global variables that are set and used
// across the application
let gl, program, squareVertexBuffer;

// Create a program with the appropriate vertex and fragment shaders
async function initProgram() {
  [gl, program] = await initializeShaders(gl, 2, 2);

  // Use this program instance
  gl.useProgram(program);
  // We attach the location of these shader values to the program instance
  // for easy access later in the code
  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
}

// Set up the buffers for the square
function initBuffers() {
  /*
    V0                    V3
    (-0.5, 0.5, 0)        (0.5, 0.5, 0)
    X---------------------X
    |                     |
    |                     |
    |       (0, 0)        |
    |                     |
    |                     |
    X---------------------X
    V1                    V2
    (-0.5, -0.5, 0)       (0.5, -0.5, 0)
  */
  const vertices = [
    // first triangle (V0, V1, V2)
    -0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0,

    // second triangle (V0, V2, V3)
    -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0,
  ];

  // Setting up the VBO
  squareVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Clean
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// We call draw to render to our canvas
function draw() {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Use the buffers we've constructed
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  // Draw to the scene using triangle primitives and the number of vertices
  // that define our geometry (i.e. six in this case)
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Clean
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// Entry point to our application
async function init() {
  // Retrieve the canvas
  const canvas = utils.getCanvas("webgl-canvas");
  // Set the canvas to the size of the screen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Retrieve a WebGL context
  gl = utils.getGLContext(canvas);
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Call the functions in an appropriate order
  await initProgram();
  initBuffers();
  draw();
}

// Call init once the webpage has loaded
window.onload = init;
