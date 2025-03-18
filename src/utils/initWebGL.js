import { loadShaders } from "../utils/shader-loader.js";

async function initWebGL() {
  const { vertexShader, fragmentShader } = await loadShaders(
    "../shaders/chapter1/example1_vertex.glsl",
    "../shaders/chapter1/example1_fragment.glsl"
  );

  const gl = document.querySelector("canvas").getContext("webgl");
  const program = createWebGLProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);
}

initWebGL();
