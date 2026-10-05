import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "dist/cli");
await build({
  configFile: false,
  root: resolve(root, "cli/browser"),
  base: "./",
  publicDir: false,
  resolve: { dedupe: ["react", "react-dom", "react/jsx-runtime"] },
  define: { "process.env.IS_PREACT": JSON.stringify("false") },
  build: { outDir, emptyOutDir: true, chunkSizeWarningLimit: 3000 },
});
const require = createRequire(import.meta.url);
const fonts = resolve(
  dirname(require.resolve("@excalidraw/excalidraw")),
  "fonts/Excalifont"
);
await mkdir(resolve(outDir, "fonts"), { recursive: true });
await cp(fonts, resolve(outDir, "fonts/Excalifont"), { recursive: true });
