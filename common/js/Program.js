"use strict";

// Program constructor that takes a WebGL context and paths
// to extract vertex and fragment shader source code from the scripts
class Program {
  constructor(gl, vShaderSource, fShaderSource) {
    this.gl = gl;
    this.program = gl.createProgram();

    if (!(vShaderSource && fShaderSource)) {
      return console.error("No shader were provided");
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fShaderSource);
    gl.compileShader(fragmentShader);

    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      return console.error("Could not initialize shaders.");
    }

    this.useProgram();
  }

  // Sets the WebGL context to use current program
  useProgram() {
    this.gl.useProgram(this.program);
  }

  // Load up the given attributes and uniforms from the given values
  load(attributes, uniforms) {
    this.useProgram();
    this.setAttributeLocations(attributes);
    this.setUniformLocations(uniforms);
  }

  // Set references to attributes onto the program instance
  setAttributeLocations(attributes) {
    attributes.forEach((attribute) => {
      this[attribute] = this.gl.getAttribLocation(this.program, attribute);
    });
  }

  // Set references to uniforms onto the program instance
  setUniformLocations(uniforms) {
    uniforms.forEach((uniform) => {
      this[uniform] = this.gl.getUniformLocation(this.program, uniform);
    });
  }

  // Get the uniform location from the program
  getUniform(uniformLocation) {
    return this.gl.getUniform(this.program, uniformLocation);
  }
}
