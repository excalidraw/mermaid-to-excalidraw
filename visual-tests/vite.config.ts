import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  define: {
    "process.env.IS_PREACT": JSON.stringify("false"),
  },
  plugins: [
    {
      name: "copy-excalifont",
      configResolved() {
        console.info(
          "\n[task] Copying Excalifont font files from @excalidraw/excalidraw into visual-tests/public/fonts/",
        );
        // Copy Excalifont woff2 files from @excalidraw/excalidraw dist into
        // visual-tests/public/fonts/ so Vite can serve them as static assets.
        const require_ = createRequire(import.meta.url);
        const excalidrawEntry = require_.resolve("@excalidraw/excalidraw");
        const srcFontsDir = resolve(
          dirname(excalidrawEntry),
          "fonts",
          "Excalifont",
        );
        const destFontsDir = resolve(
          __dirname,
          "public",
          "fonts",
          "Excalifont",
        );
        mkdirSync(destFontsDir, { recursive: true });
        cpSync(srcFontsDir, destFontsDir, { recursive: true });
      },
    },
    {
      name: "notify-build-start",
      buildStart() {
        console.info("\n[task] Starting Vite dev server for visual tests...\n");
      },
    },
  ],
  server: {
    port: 3419,
    fs: { allow: [__dirname, resolve(__dirname, "..")] },
  },
});
