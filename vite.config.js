import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [glsl()],
  publicDir: "common/assets",
  root: ".",
  server: {
    open: true,
  },
});
