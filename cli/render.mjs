import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/cli/", import.meta.url));
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

export async function renderDiagram(input) {
  try {
    await readFile(resolve(root, "index.html"));
  } catch {
    throw new Error(
      "CLI renderer is missing. Run yarn build:cli in the project folder first."
    );
  }
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    throw new Error(
      "Playwright is missing. Install dependencies with yarn install (including optional dependencies)."
    );
  }
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname
      );
      const path = resolve(
        root,
        `.${pathname === "/" ? "/index.html" : pathname}`
      );
      if (!path.startsWith(resolve(root) + sep)) {
        response.writeHead(403).end();
        return;
      }
      const data = await readFile(path);
      response
        .writeHead(200, {
          "Content-Type":
            contentTypes[extname(path)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  let browser;
  let timer;
  try {
    await new Promise((done, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", done);
    });
    try {
      browser = await chromium.launch({ headless: true });
    } catch (error) {
      if (error.message.includes("Executable doesn't exist")) {
        throw new Error(
          "Chromium is missing. Run npx playwright install chromium in the project folder."
        );
      }
      throw error;
    }
    const page = await browser.newPage({
      viewport: { width: 1800, height: 1200 },
    });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    try {
      await page.waitForFunction(
        () => typeof window.convertDiagram === "function",
        undefined,
        { timeout: 30000 }
      );
    } catch (error) {
      throw new Error(pageErrors.join("\n") || error.message);
    }
    return await Promise.race([
      page.evaluate((payload) => window.convertDiagram(payload), input),
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(new Error("Diagram conversion timed out after 60 seconds.")),
          60000
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
    await browser?.close();
    await new Promise((done) => server.close(done));
  }
}
