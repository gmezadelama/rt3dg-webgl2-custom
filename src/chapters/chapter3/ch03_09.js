"use strict";

// Global variables to use throughout application
let gl,
  program,
  clearColor = [0.9, 0.9, 0.9],
  modelViewMatrix = mat4.create(),
  projectionMatrix = mat4.create(),
  normalMatrix = mat4.create(),
  parts = [],
  angle = 0,
  lastTime = 0,
  distance = -120,
  shininess = 24,
  lightPosition = [100, 400, 100];

async function initProgram() {
  // Configure `canvas`
  const canvas = document.getElementById("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  // Configure `gl`
  gl = utils.getGLContext(canvas);
  gl.clearColor(...clearColor, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Load shader sources
  const { vertexShaderSource, fragmentShaderSource } = await loadShadersSources(
    3,
    9
  );
  // Configure program
  program = new Program(gl, vertexShaderSource, fragmentShaderSource);

  // Attributes to be loaded into program
  const attributes = ["aVertexPosition", "aVertexNormal"];

  // Uniforms to be loaded into program
  const uniforms = [
    "uProjectionMatrix",
    "uModelViewMatrix",
    "uNormalMatrix",
    "uLightAmbient",
    "uLightPosition",
    "uMaterialSpecular",
    "uMaterialDiffuse",
    "uShininess",
  ];

  // Load attributes and uniforms
  program.load(attributes, uniforms);
}

// Configure lights
function initLights() {
  gl.uniform3fv(program.uLightPosition, lightPosition);
  gl.uniform3f(program.uLightAmbient, 0.1, 0.1, 0.1);
  gl.uniform3f(program.uMaterialSpecular, 0.5, 0.5, 0.5);
  gl.uniform3f(program.uMaterialDiffuse, 0.8, 0.8, 0.8);
  gl.uniform1f(program.uShininess, shininess);
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // We will discuss these operations in later chapters
  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, distance]);
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    (20 * Math.PI) / 180,
    [1, 0, 0]
  );
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    (angle * Math.PI) / 180,
    [0, 1, 0]
  );

  mat4.copy(normalMatrix, modelViewMatrix);
  mat4.invert(normalMatrix, normalMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);

  // Iterate over `parts` and draw
  parts.forEach((part) => {
    // Bind
    gl.bindVertexArray(part.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.ibo);

    // Draw
    gl.drawElements(gl.TRIANGLES, part.indices.length, gl.UNSIGNED_SHORT, 0);
  });

  // Clean
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function animate() {
  const timeNow = new Date().getTime();
  if (lastTime) {
    const elapsed = timeNow - lastTime;
    angle += (90 * elapsed) / 10000;
  }
  lastTime = timeNow;
}

function render() {
  requestAnimationFrame(render);
  draw();
  animate();
}

function load() {
  for (let i = 1; i < 179; i++) {
    fetch(`../../common/assets/images/models/nissan-gtr/part${i}.json`)
      .then((res) => res.json())
      .then((part) => {
        // Configure VAO
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Vertices
        const vertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(part.vertices),
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

        // Normals
        const normalBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(utils.calculateNormals(part.vertices, part.indices)),
          gl.STATIC_DRAW
        );
        // Configure instructions for VAO
        gl.enableVertexAttribArray(program.aVertexNormal);
        gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

        // Indices
        const indexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
        gl.bufferData(
          gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(part.indices),
          gl.STATIC_DRAW
        );

        // Set values to be able to draw later
        part.vao = vao;
        part.ibo = indexBufferObject;

        // Push onto `parts` array for later access
        parts.push(part);

        // Clean
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      });
  }
}

async function init() {
  await initProgram();
  initLights();
  load();
  render();

  initControls();
}

function initControls() {
  utils.configureControls({
    "Car Color": {
      value: [255, 255, 255],
      onChange: (v) =>
        gl.uniform3f(program.uMaterialDiffuse, ...utils.normalizeColor(v)),
    },
    Background: {
      value: utils.denormalizeColor(clearColor),
      onChange: (v) => gl.clearColor(...utils.normalizeColor(v), 1),
    },
    Shininess: {
      value: shininess,
      min: 1,
      max: 50,
      step: 0.1,
      onChange: (value) => gl.uniform1f(program.uShininess, value),
    },
    Distance: {
      value: distance,
      min: -600,
      max: -80,
      step: 1,
      onChange: (value) => (distance = value),
    },
    // Spread all values from the reduce onto the controls
    ...["Translate X", "Translate Y", "Translate Z"].reduce(
      (result, name, i) => {
        result[name] = {
          value: lightPosition[i],
          min: -1000,
          max: 1000,
          step: -0.1,
          onChange(v, state) {
            gl.uniform3fv(program.uLightPosition, [
              state["Translate X"],
              state["Translate Y"],
              state["Translate Z"],
            ]);
          },
        };
        return result;
      },
      {}
    ),
  });
}

window.onload = init;
