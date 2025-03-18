async function loadShader(url) {
  const response = await fetch(url);
  return await response.text();
}

async function loadShadersSources(chapter, example) {
  const vertexPath = `../../shaders/chapter${chapter}/example${
    chapter < 10 ? `0${chapter}` : `${chapter}`
  }_${example < 10 ? `0${example}` : `${example}`}_vertex.glsl`;
  const fragmentPath = `../../shaders/chapter${chapter}/example${
    chapter < 10 ? `0${chapter}` : `${chapter}`
  }_${example < 10 ? `0${example}` : `${example}`}_fragment.glsl`;
  ("../../../shaders/chapter1/example01_04_fragment.glsl");
  // console.log("vertexPath", vertexPath);
  // console.log("fragmentPath", fragmentPath);
  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    loadShader(vertexPath),
    loadShader(fragmentPath),
  ]);

  return {
    vertexShaderSource,
    fragmentShaderSource,
  };
}

async function loadShaders(gl, chapter, example) {
  const vertexPath = `../../shaders/chapter${chapter}/example${
    chapter < 10 ? `0${chapter}` : `${chapter}`
  }_${example < 10 ? `0${example}` : `${example}`}_vertex.glsl`;
  const fragmentPath = `../../shaders/chapter${chapter}/example${
    chapter < 10 ? `0${chapter}` : `${chapter}`
  }_${example < 10 ? `0${example}` : `${example}`}_fragment.glsl`;
  ("../../../shaders/chapter1/example01_04_fragment.glsl");
  // console.log("vertexPath", vertexPath);
  // console.log("fragmentPath", fragmentPath);
  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    loadShader(vertexPath),
    loadShader(fragmentPath),
  ]);

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  return {
    vertexShader,
    fragmentShader,
  };
}

async function initializeShaders(gl, chapter, example) {
  const { vertexShader, fragmentShader } = await loadShaders(
    gl,
    chapter,
    example
  );
  // Create a program
  const program = gl.createProgram();
  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Could not initialize shaders");
  }

  return [gl, program];
}
