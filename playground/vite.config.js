import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../public",
    emptyOutDir: true,
  },
  server: {
    warmup: {
      /* 
        A small performance improvement so that this file is already transformed, cached when we receive the request :)
        See more: https://vitejs.dev/guide/performance.html#warm-up-frequently-used-files
      */
      clientFiles: [
        "../src/graphToExcalidraw.ts",
        "./initExcalidraw.ts",
        "../src/parser/class.ts",
        "../src/parser/flowchart.ts",
        "../src/parser/sequence.ts",
        "./testcases/class.ts",
        "./testcases/flowchart.ts",
        "./testcases/sequence.ts",
        "./testcases/unsupported.ts",
      ],
    },
  },
});
