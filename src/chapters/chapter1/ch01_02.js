// Enforcing all JS to be executed in "strict mode"
"use strict";

function init() {
  const canvas = document.getElementById("webgl-canvas");

  // Ensure we have a canvas
  if (!canvas) {
    console.error("Sorry! No HTML5 Canvas was found on this page");
    return;
  }

  const gl = canvas.getContext("webgl2");

  // Ensure we have a context
  const message = gl
    ? "Hooray! You got a WebGL2 context"
    : "Sorry! WebGL is not available";

  alert(message);
}

// Call init once the document has loaded
window.onload = init;
