// Renders the README banner, hero.html, to ../banner-light.png and ../banner-dark.png.
// Fonts: Geist and Geist Mono (Vercel) and Excalifont (Excalidraw), all under the SIL Open Font License 1.1.
// The code card shows flow.mmd; the diagram is that file converted with this package, through the Excalidraw CLI:
//   npx @excalidraw/cli mermaid flow.mmd --out flow-light.png --scale 2 --padding 24 --theme light
// (and again with --theme dark). Regenerate both when you change flow.mmd.
// hero.html fetches flow.mmd, so it is served over http rather than opened as a file.
// Run with: node .github/assets/banner/render.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = new URL(".", import.meta.url);
const types = {
  ".html": "text/html",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".mmd": "text/plain",
};
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname.slice(1);
  try {
    const body = await readFile(new URL(path, here));
    res
      .writeHead(200, {
        "content-type": types[extname(path)] ?? "application/octet-stream",
      })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  executablePath:
    process.env.EXCALIDRAW_BROWSER_PATH ?? "/opt/google/chrome/chrome",
});
const page = await browser.newPage({
  deviceScaleFactor: 1.5,
  viewport: { width: 1280, height: 600 },
});
for (const theme of ["light", "dark"]) {
  await page.goto(`${origin}/hero.html?theme=${theme}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      document.getElementById("diagram").complete &&
      document.getElementById("source").dataset.ready
  );
  await page.locator("#hero").screenshot({
    path: fileURLToPath(new URL(`../banner-${theme}.png`, here)),
    omitBackground: true,
  });
}
await browser.close();
server.close();
