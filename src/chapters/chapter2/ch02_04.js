"use strict";

let gl,
  program,
  indices,
  trapezoidVAO,
  trapezoidIndexBuffer,
  // Global variable that captures the current rendering mode type
  renderingMode = "TRIANGLES";

async function initProgram() {
  [gl, program] = await initializeShaders(gl, 2, 4);

  gl.useProgram(program);
  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
}

function initBuffers() {
  const vertices = [
    -0.5, -0.5, 0, -0.25, 0.5, 0, 0.0, -0.5, 0, 0.25, 0.5, 0, 0.5, -0.5, 0,
  ];

  indices = [0, 1, 2, 0, 2, 3, 2, 3, 4];

  // Create VAO
  trapezoidVAO = gl.createVertexArray();

  // Bind VAO
  gl.bindVertexArray(trapezoidVAO);

  const trapezoidVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trapezoidVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // Provide instructions to VAO
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  trapezoidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, trapezoidIndexBuffer);
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
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Bind VAO
  gl.bindVertexArray(trapezoidVAO);

  // Depending on the rendering mode type, we will draw differently
  switch (renderingMode) {
    case "TRIANGLES": {
      indices = [0, 1, 2, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINES": {
      indices = [1, 3, 0, 4, 1, 2, 2, 3];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "POINTS": {
      indices = [1, 2, 3];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.POINTS, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINE_LOOP": {
      indices = [2, 3, 4, 1, 0];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINE_STRIP": {
      indices = [2, 3, 4, 1, 0];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "TRIANGLE_STRIP": {
      indices = [0, 1, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "TRIANGLE_FAN": {
      indices = [0, 1, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLE_FAN, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
  }

  // Clean
  gl.bindVertexArray(null);
}

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

  initControls();
}

window.onload = init;

function initControls() {
  // A wrapper around dat.GUI interface for a simpler API
  // for the purpose of this book
  utils.configureControls({
    "Rendering Mode": {
      value: renderingMode,
      options: [
        "TRIANGLES",
        "LINES",
        "POINTS",
        "LINE_LOOP",
        "LINE_STRIP",
        "TRIANGLE_STRIP",
        "TRIANGLE_FAN",
      ],
      onChange: (v) => (renderingMode = v),
    },
  });
}
