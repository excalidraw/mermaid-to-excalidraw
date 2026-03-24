/**
 * Copies Excalifont woff2 files from @excalidraw/excalidraw dist into
 * visual-tests/public/fonts/ so Vite can serve them as static assets.
 *
 * Run before visual tests: `node visual-tests/copy-fonts.mjs`
 */
import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// require.resolve("@excalidraw/excalidraw") → .../dist/prod/index.js
const excalidrawEntry = require.resolve("@excalidraw/excalidraw");
const srcFontsDir = resolve(dirname(excalidrawEntry), "fonts", "Excalifont");
const destFontsDir = resolve(
  dirname(new URL(import.meta.url).pathname),
  "public",
  "fonts",
  "Excalifont",
);

mkdirSync(destFontsDir, { recursive: true });
cpSync(srcFontsDir, destFontsDir, { recursive: true });

console.info(`Copied Excalifont fonts → ${destFontsDir}`);
