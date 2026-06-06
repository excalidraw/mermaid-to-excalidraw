import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { cpSync, createReadStream, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getExcalifontSourceDir = () => {
  const require_ = createRequire(import.meta.url);
  const excalidrawEntry = require_.resolve("@excalidraw/excalidraw");
  return resolve(dirname(excalidrawEntry), "fonts", "Excalifont");
};

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
  plugins: [
    react(),
    {
      name: "copy-excalifont",
      configResolved() {
        const srcFontsDir = getExcalifontSourceDir();
        const destFontsDir = resolve(
          __dirname,
          "..",
          "public",
          "fonts",
          "Excalifont"
        );

        mkdirSync(destFontsDir, { recursive: true });
        cpSync(srcFontsDir, destFontsDir, { recursive: true });
      },
      configureServer(server) {
        const srcFontsDir = getExcalifontSourceDir();

        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith("/fonts/Excalifont/")) {
            next();
            return;
          }

          const { pathname } = new URL(req.url, "http://localhost");
          const filename = basename(decodeURIComponent(pathname));
          const fontPath = resolve(srcFontsDir, filename);

          if (!fontPath.startsWith(srcFontsDir) || !existsSync(fontPath)) {
            next();
            return;
          }

          res.setHeader("Content-Type", "font/woff2");
          createReadStream(fontPath).pipe(res);
        });
      },
    },
  ],
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
