// Enforcing all JS to be executed in "strict mode"
"use strict";

// Global variable to access throughout the application
let gl;

function updateClearColor(...color) {
  // The ES6 spread operator (...) allows for us to
  // use elements of an array as arguments to a function
  gl.clearColor(...color);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, 0, 0);
}

function checkKey(event) {
  switch (event.keyCode) {
    // number 1 => green
    case 49: {
      updateClearColor(0.2, 0.8, 0.2, 1.0);
      break;
    }
    // number 2 => blue
    case 50: {
      updateClearColor(0.2, 0.2, 0.8, 1.0);
      break;
    }
    // number 3 => random color
    case 51: {
      updateClearColor(Math.random(), Math.random(), Math.random(), 1.0);
      break;
    }
    // number 4 => get color
    case 52: {
      const color = gl.getParameter(gl.COLOR_CLEAR_VALUE);
      // Don't let the following line confuse you.
      // It basically rounds up the numbers to one
      // decimal cipher for visualization purposes.

      // TIP: Given that WebGL's color space ranges
      // from 0 to 1 you can multiply these values by 255
      // to display in their RGB values.
      alert(`clearColor = (
      ${color[0].toFixed(1)},
      ${color[1].toFixed(1)},
      ${color[2].toFixed(1)}
    )`);
      window.focus();
      break;
    }
  }
}

function init() {
  // Use the utility method `getCanvas` to retrieve our canvas
  const canvas = utils.getCanvas("webgl-canvas");
  // Use the utility method `getGLContext` to retrieve our WebGL 2 context
  gl = utils.getGLContext(canvas);

  // Call checkKey whenever a key is pressed
  window.onkeydown = checkKey;
}

window.onload = init;
