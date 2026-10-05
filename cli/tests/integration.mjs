import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { extractDefinition } from "../input.mjs";

const cli = fileURLToPath(new URL("../index.mjs", import.meta.url));
let cwd;
before(async () => {
  cwd = await mkdtemp(join(tmpdir(), "mermaid cli test "));
});
after(async () => {
  await rm(cwd, { recursive: true, force: true });
});

function run(args, stdin = "") {
  return new Promise((done, reject) => {
    const child = spawn(process.execPath, [cli, ...args], { cwd });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => done({ code, stdout, stderr }));
    child.stdin.on("error", () => {});
    child.stdin.end(stdin);
  });
}

test("accepts raw and fenced Mermaid, rejects empty and ambiguous input", () => {
  assert.equal(
    extractDefinition(" flowchart LR\nA-->B "),
    "flowchart LR\nA-->B"
  );
  assert.equal(
    extractDefinition(
      "# Notes\n```mermaid\nflowchart LR\nA-->B\n```\n# Resources"
    ),
    "flowchart LR\nA-->B"
  );
  assert.equal(
    extractDefinition("~~~mermaid\r\nflowchart LR\r\nA-->B\r\n~~~"),
    "flowchart LR\r\nA-->B"
  );
  assert.throws(() => extractDefinition(" \n"), /empty/);
  assert.throws(
    () => extractDefinition("```mermaid\nA\n```\n```mermaid\nB\n```"),
    /multiple/
  );
});

test(
  "exports colored editable shapes, resource IDs and SVG from another folder",
  { timeout: 90000 },
  async () => {
    await writeFile(
      join(cwd, "input file.md"),
      "# Diagram\n```mermaid\nflowchart LR\nA[Workshop] --> B[Calculations]\nclassDef blue fill:#d0ebff,stroke:#1864ab,color:#1864ab;\nclass A blue;\n```\n# Notes"
    );
    await writeFile(
      join(cwd, "resources.md"),
      "# Resources\n1. Workshop\n:resource[ri.workshop.main.module.example]\nFile: src/functions/calculate.ts"
    );
    await writeFile(
      join(cwd, "config.json"),
      JSON.stringify({ themeVariables: { fontSize: "18px" } })
    );
    const result = await run([
      "input file.md",
      "-o",
      "nested/output file.excalidraw",
      "--resources",
      "resources.md",
      "--svg",
      "nested/preview.svg",
      "--font-size",
      "24",
      "--config",
      "config.json",
    ]);
    assert.equal(result.code, 0, result.stderr);
    const scene = JSON.parse(
      await readFile(join(cwd, "nested/output file.excalidraw"), "utf8")
    );
    assert.equal(scene.type, "excalidraw");
    assert.equal(scene.version, 2);
    assert.equal(
      scene.elements.filter((e) => e.type === "rectangle").length,
      2
    );
    assert.equal(scene.elements.filter((e) => e.type === "arrow").length, 1);
    assert.equal(
      scene.elements.some((e) => e.type === "image"),
      false
    );
    assert.ok(
      scene.elements.some(
        (e) =>
          e.type === "rectangle" &&
          e.backgroundColor === "#d0ebff" &&
          e.strokeColor === "#1864ab"
      )
    );
    assert.ok(
      scene.elements.some((e) => e.type === "text" && e.fontSize === 24)
    );
    assert.ok(
      scene.elements.some(
        (e) =>
          e.type === "text" &&
          e.text.includes("ri.workshop.main.module.example") &&
          e.text.includes("src/functions/calculate.ts")
      )
    );
    const arrow = scene.elements.find((e) => e.type === "arrow");
    assert.ok(
      scene.elements.some((e) => e.id === arrow.startBinding.elementId)
    );
    assert.ok(scene.elements.some((e) => e.id === arrow.endBinding.elementId));
    assert.match(
      await readFile(join(cwd, "nested/preview.svg"), "utf8"),
      /<svg/
    );
  }
);

test(
  "reads piped input, protects output files and supports explicit replacement",
  { timeout: 90000 },
  async () => {
    const input = "flowchart TD\nA[Start] --> B[End]";
    const first = await run(["-", "-o", "pipe.excalidraw"], input);
    assert.equal(first.code, 0, first.stderr);
    const original = await readFile(join(cwd, "pipe.excalidraw"), "utf8");
    const protectedOutput = await run(["-", "-o", "pipe.excalidraw"], input);
    assert.equal(protectedOutput.code, 1);
    assert.match(protectedOutput.stderr, /already exists/);
    assert.equal(
      await readFile(join(cwd, "pipe.excalidraw"), "utf8"),
      original
    );
    const replaced = await run(
      ["-", "-o", "pipe.excalidraw", "--force"],
      "flowchart TD\nC[Changed]"
    );
    assert.equal(replaced.code, 0, replaced.stderr);
    const scene = JSON.parse(
      await readFile(join(cwd, "pipe.excalidraw"), "utf8")
    );
    assert.ok(
      scene.elements.some((e) => e.type === "text" && e.text === "Changed")
    );
  }
);

test(
  "rejects parse errors and invalid flags without writing an output",
  { timeout: 90000 },
  async () => {
    const invalid = await run(
      ["-", "-o", "invalid.excalidraw"],
      "flowchart TD\nA[unclosed"
    );
    assert.equal(invalid.code, 1);
    assert.match(invalid.stderr, /parse error/i);
    await assert.rejects(readFile(join(cwd, "invalid.excalidraw")), {
      code: "ENOENT",
    });
    assert.equal(
      (await run(["-", "--font-size", "0"], "flowchart TD\nA")).code,
      1
    );
    assert.equal((await run(["--not-an-option"])).code, 1);
  }
);

test(
  "preserves embedded image files for diagram types with SVG fallback",
  { timeout: 90000 },
  async () => {
    const result = await run(
      ["-", "-o", "fallback.excalidraw"],
      "gantt\n    title Schedule\n    dateFormat YYYY-MM-DD\n    section Work\n    Task :2026-10-05, 1d"
    );
    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stderr, /image fallback/);
    const scene = JSON.parse(
      await readFile(join(cwd, "fallback.excalidraw"), "utf8")
    );
    const image = scene.elements.find((e) => e.type === "image");
    assert.ok(image);
    assert.ok(
      scene.files[image.fileId].dataURL.startsWith("data:image/svg+xml;base64,")
    );
  }
);
