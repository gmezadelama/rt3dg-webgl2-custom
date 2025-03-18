"use scrict";

// Global variables to be used across application
let gl,
  program,
  scene,
  clock,
  camera,
  transforms,
  lights,
  floor,
  lightPositions,
  carModelData,
  clearColor = [0.9, 0.9, 0.9];

// Configure application
async function configure() {
  // Configure `canvas`
  const canvas = utils.getCanvas("webgl-canvas");
  utils.autoResizeCanvas(canvas);

  // Configure `gl`
  gl = utils.getGLContext(canvas);
  gl.clearColor(...clearColor, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Configure `program`
  const { vertexShaderSource, fragmentShaderSource } = await loadShadersSources(
    1,
    4
  );
  program = new Program(gl, vertexShaderSource, fragmentShaderSource);

  const attributes = ["aVertexPosition", "aVertexNormal", "aVertexColor"];

  const uniforms = [
    "uProjectionMatrix",
    "uModelViewMatrix",
    "uNormalMatrix",
    "uLightPosition",
    "uWireframe",
    "uLd",
    "uLs",
    "uKa",
    "uKd",
    "uKs",
    "uNs",
    "uD",
    "uIllum",
  ];

  // Load attributes and uniforms into program
  program.load(attributes, uniforms);

  // Configure `scene` and `clock`
  scene = new Scene(gl, program);
  clock = new Clock();

  // Configure `camera` and `controls`
  camera = new Camera(Camera.ORBITING_TYPE);
  new Controls(camera, canvas);

  // Configure `transforms`
  transforms = new Transforms(gl, program, camera, canvas);

  // Configure `lights`
  lights = new LightsManager();

  // Light positions for each individual light in the scene
  lightPositions = {
    farLeft: [-1000, 1000, -1000],
    farRight: [1000, 1000, -1000],
    nearLeft: [-1000, 1000, 1000],
    nearRight: [1000, 1000, 1000],
  };

  // Iterate over each light and configure
  Object.keys(lightPositions).forEach((key) => {
    const light = new Light(key);
    light.setPosition(lightPositions[key]);
    light.setDiffuse([0.4, 0.4, 0.4]);
    light.setSpecular([0.8, 0.8, 0.8]);
    lights.add(light);
  });

  gl.uniform3fv(program.uLightPosition, lights.getArray("position"));
  gl.uniform3fv(program.uLd, lights.getArray("diffuse"));
  gl.uniform3fv(program.uLs, lights.getArray("specular"));

  gl.uniform3fv(program.uKa, [1, 1, 1]);
  gl.uniform3fv(program.uKd, [1, 1, 1]);
  gl.uniform3fv(program.uKs, [1, 1, 1]);
  gl.uniform1f(program.uNs, 1);

  // Configure `floor`
  floor = new Floor(200, 2);

  // Data describing car model
  carModelData = {
    // This is the alias that's used to determine whether the item being
    // loaded is a body panel with paint. Each object within the model has particular
    // aliases that were set by the 3D artists.
    paintAlias: "paint",
    // This is the number of parts to load for this particular model
    partsCount: 178,
    // The path to the model
    path: "../../../common/assets/images/models/nissan-gtr/part",
  };
}

// Position `camera` back to home
function goHome() {
  camera.goHome([0, 10, 80]);
  camera.setFocus([0, 0, 0]);
  camera.setAzimuth(30);
  camera.setElevation(-10);
}

// Load the car into our scene
function loadCar() {
  scene.objects = [];
  scene.add(floor);
  const { path, partsCount } = carModelData;
  scene.loadByParts(path, partsCount);
}

function load() {
  goHome();
  loadCar();
}

function draw() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  transforms.updatePerspective();

  try {
    // Iterate over every object in the scene
    scene.traverse((object) => {
      // If object is not visisble, then no need to render anything
      if (!object.visible) return;

      // Apply transformations
      transforms.calculateModelView();
      transforms.push();
      transforms.setMatrixUniforms();
      transforms.pop();

      // Set uniforms
      gl.uniform3fv(program.uKa, object.Ka);
      gl.uniform3fv(program.uKd, object.Kd);
      gl.uniform3fv(program.uKs, object.Ks);
      gl.uniform1f(program.uNs, object.Ns);
      gl.uniform1f(program.uD, object.d);
      gl.uniform1i(program.uIllum, object.illum);

      // Bind
      gl.bindVertexArray(object.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);

      if (object.wireframe) {
        gl.uniform1i(program.uWireframe, 1);
        gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.uniform1i(program.uWireframe, 0);
        gl.drawElements(
          gl.TRIANGLES,
          object.indices.length,
          gl.UNSIGNED_SHORT,
          0
        );
      }

      // Clean
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    });
  } catch (error) {
    console.error(error);
  }
}

async function init() {
  console.log("calling init");
  await configure();
  load();
  clock.on("tick", draw);

  initControls();
}

window.onload = init;

function initControls() {
  utils.configureControls({
    Car: {
      Color: {
        value: [255, 255, 255],
        onChange: (v) => {
          const color = utils.normalizeColor(v);
          eachCarPanel((item) => (item.Kd = color));
        },
      },
      Shininess: {
        value: 0.5,
        min: 0,
        max: 50,
        step: 0.1,
        onChange: (v) => {
          const shininess = [v, v, v];
          eachCarPanel((item) => (item.Ks = shininess));
        },
      },
    },
    ...Object.keys(lightPositions).reduce(
      (result, key) => {
        const { Lights } = result;
        const light = (Lights[key] = {});
        ["Diffuse", "Specular"].forEach((property) => {
          light[property] = {
            value: 0.5,
            min: 0,
            max: 1,
            step: 0.1,
            onChange: (v) => {
              const value = [v, v, v];
              const light = lights.get(key);
              switch (property) {
                case "Diffuse":
                  light.setDiffuse(value);
                  gl.uniform3fv(program.uLd, lights.getArray("diffuse"));
                  break;
                case "Specular":
                  light.setSpecular(value);
                  gl.uniform3fv(program.uLs, lights.getArray("specular"));
                  break;
              }
            },
          };
        });
        return result;
      },
      { Lights: {} }
    ),
    Background: {
      value: utils.denormalizeColor(clearColor),
      onChange: (v) => gl.clearColor(...utils.normalizeColor(v), 1),
    },
    Floor: {
      value: floor.visible,
      onChange: (v) => (floor.visible = v),
    },
    "Go Home": goHome,
  });

  function eachCarPanel(cb) {
    const paintAlias = carModelData.paintAlias;
    scene.traverse((item) => {
      if (~item.alias.indexOf(paintAlias)) {
        cb(item);
      }
    });
  }
}
