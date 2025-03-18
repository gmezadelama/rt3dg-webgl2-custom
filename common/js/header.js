document.addEventListener("DOMContentLoaded", () => {
  // Check if the current page is the homepage
  const isHomePage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("index.html");

  if (!isHomePage) {
    const header = document.createElement("header");
    header.innerHTML = `
            <nav>
                <a style="color: initial;" href="/index.html">Home</a>
            </nav>
            <hr>
        `;
    document.body.insertBefore(header, document.body.firstChild);
  }
});
