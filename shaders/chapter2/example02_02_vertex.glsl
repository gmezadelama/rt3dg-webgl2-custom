#version 300 es
precision mediump float;

// Supplied vertex position attribute
in vec3 aVertexPosition;

void main(void) {
    // Simply set the position in clipspace coordinates
    gl_Position = vec4(aVertexPosition, 1.0);
}
