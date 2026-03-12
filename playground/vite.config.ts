import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    outDir: "../public",
    emptyOutDir: true,
    assetsDir: "./",
    minify: false,
    sourcemap: true,
  },
  define: {
    "process.env.IS_PREACT": JSON.stringify("false"),
  },
  plugins: [react()],
  server: {
    port: 3418,
    open: true,
    warmup: {
      /*
        A small performance improvement so that this file is already transformed, cached when we receive the request :)
        See more: https://vitejs.dev/guide/performance.html#warm-up-frequently-used-files
      */
      clientFiles: [
        "./testcases/**/*",
        "../src/parser/**/*",
        "../src/graphToExcalidraw.ts",
        "./initExcalidraw.ts",
      ],
    },
  },
  // Enable source maps in dev mode
  esbuild: {
    sourcemap: true,
  },
});
