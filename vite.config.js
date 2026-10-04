import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/Pulse/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        pulse: resolve(import.meta.dirname, "src/pulse.html")
      }
    }
  }
});