"use strict";

// Storing relevant values globally to be used throughout application
let gl,
  program,
  modelViewMatrix = mat4.create(),
  projectionMatrix = mat4.create(),
  normalMatrix = mat4.create(),
  objects = [],
  angle = 0,
  lastTime = 0,
  lightPosition = [4.5, 3, 15],
  shininess = 200,
  distance = -100;

async function initProgram() {
  // Configure `canvas`
  const canvas = document.getElementById("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  // Configure `gl`
  gl = utils.getGLContext(canvas);
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clearDepth(100);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  [gl, program] = await initializeShaders(gl, 3, 7);

  gl.useProgram(program);

  // Setting locations onto `program` instance
  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.aVertexNormal = gl.getAttribLocation(program, "aVertexNormal");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
  program.uMaterialAmbient = gl.getUniformLocation(program, "uMaterialAmbient");
  program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
  program.uMaterialSpecular = gl.getUniformLocation(
    program,
    "uMaterialSpecular"
  );
  program.uShininess = gl.getUniformLocation(program, "uShininess");
  program.uLightPosition = gl.getUniformLocation(program, "uLightPosition");
  program.uLightAmbient = gl.getUniformLocation(program, "uLightAmbient");
  program.uLightDiffuse = gl.getUniformLocation(program, "uLightDiffuse");
  program.uLightSpecular = gl.getUniformLocation(program, "uLightSpecular");
}

// Configure lights
function initLights() {
  gl.uniform3fv(program.uLightPosition, lightPosition);
  gl.uniform4f(program.uLightAmbient, 1, 1, 1, 1);
  gl.uniform4f(program.uLightDiffuse, 1, 1, 1, 1);
  gl.uniform4f(program.uLightSpecular, 1, 1, 1, 1);
  gl.uniform4f(program.uMaterialAmbient, 0.1, 0.1, 0.1, 1);
  gl.uniform4f(program.uMaterialDiffuse, 0.5, 0.8, 0.1, 1);
  gl.uniform4f(program.uMaterialSpecular, 0.6, 0.6, 0.6, 1);
  gl.uniform1f(program.uShininess, shininess);
}

function draw() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(
    projectionMatrix,
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );

  // We will start using the `try/catch` to capture any errors from our `draw` calls
  try {
    // Iterate over every object
    objects.forEach((object) => {
      // We will cover these operations in later chapters
      mat4.identity(modelViewMatrix);
      mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, distance]);
      mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        (30 * Math.PI) / 180,
        [1, 0, 0]
      );
      mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        (angle * Math.PI) / 180,
        [0, 1, 0]
      );

      // If object is the light, we update its position
      if (object.alias === "light") {
        const lightPosition = gl.getUniform(program, program.uLightPosition);
        mat4.translate(modelViewMatrix, modelViewMatrix, lightPosition);
      }

      mat4.copy(normalMatrix, modelViewMatrix);
      mat4.invert(normalMatrix, normalMatrix);
      mat4.transpose(normalMatrix, normalMatrix);

      gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
      gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);

      // Set lighting data
      gl.uniform4fv(program.uMaterialAmbient, object.ambient);
      gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
      gl.uniform4fv(program.uMaterialSpecular, object.specular);

      // Bind
      gl.bindVertexArray(object.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);

      // Draw
      gl.drawElements(
        gl.TRIANGLES,
        object.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );

      // Clean
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    });
  } catch (error) {
    // We catch the `error` and simply output to the screen for testing/debugging purposes
    console.error(error);
  }
}

// Return the associated object, given its `alias`
function getObject(alias) {
  return objects.find((object) => object.alias === alias);
}

function animate() {
  const timeNow = new Date().getTime();
  if (lastTime) {
    const elapsed = timeNow - lastTime;
    angle += (90 * elapsed) / 10000.0;
  }
  lastTime = timeNow;
}

function render() {
  requestAnimationFrame(render);
  draw();
  animate();
}

function loadObject(filePath, alias) {
  fetch(filePath)
    .then((res) => res.json())
    .then((data) => {
      data.alias = alias;

      // Configure VAO
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      // Vertices
      const vertexBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(data.vertices),
        gl.STATIC_DRAW
      );
      // Configure instructions for VAO
      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

      // Normals
      const normalBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(utils.calculateNormals(data.vertices, data.indices)),
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
        new Uint16Array(data.indices),
        gl.STATIC_DRAW
      );

      // Attach values to be able to reference later for drawing
      data.vao = vao;
      data.ibo = indexBufferObject;

      // Push onto objects for later reference
      objects.push(data);

      // Clean
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    });
}

// Load each individual object
function load() {
  loadObject(
    "../../common/assets/images/models/geometries/plane.json",
    "plane"
  );
  loadObject("../../common/assets/images/models/geometries/cone2.json", "cone");
  loadObject(
    "../../common/assets/images/models/geometries/sphere1.json",
    "sphere"
  );
  loadObject(
    "../../common/assets/images/models/geometries/sphere3.json",
    "light"
  );
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
    "Sphere Color": {
      value: [0, 255, 0],
      onChange: (v) =>
        (getObject("sphere").diffuse = [...utils.normalizeColor(v), 1.0]),
    },
    "Cone Color": {
      value: [235, 0, 210],
      onChange: (v) =>
        (getObject("cone").diffuse = [...utils.normalizeColor(v), 1.0]),
    },
    Shininess: {
      value: shininess,
      min: 1,
      max: 50,
      step: 0.1,
      onChange: (v) => gl.uniform1f(program.uShininess, v),
    },
    // Spread all values from the reduce onto the controls
    ...["Translate X", "Translate Y", "Translate Z"].reduce(
      (result, name, i) => {
        result[name] = {
          value: lightPosition[i],
          min: -50,
          max: 50,
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
    Distance: {
      value: distance,
      min: -200,
      max: -50,
      step: 0.1,
      onChange: (v) => (distance = v),
    },
  });
}

window.onload = init;
