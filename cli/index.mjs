#!/usr/bin/env node
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { extractDefinition } from "./input.mjs";
import { renderDiagram } from "./render.mjs";

const help = `Usage: mermaid-to-excalidraw <input.mmd|input.md|-> [options]

Convert Mermaid to an Excalidraw file. Use - to read from standard input.

Options:
  -o, --output <file>      Output file (default: input.excalidraw)
      --resources <file>   Add a text or Markdown resource list beside the diagram
      --svg <file>         Also export an SVG preview
      --config <file>      Mermaid configuration as a JSON object
      --font-size <size>   Diagram font size in pixels (default: 20)
  -f, --force              Replace existing output files
  -h, --help               Show this help
  -v, --version            Show the package version

Examples:
  mermaid-to-excalidraw flow.mmd -o flow.excalidraw
  mermaid-to-excalidraw flow.mmd --resources resources.md --svg flow.svg
  cat flow.mmd | mermaid-to-excalidraw - -o flow.excalidraw
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      output: { type: "string", short: "o" },
      resources: { type: "string" },
      svg: { type: "string" },
      config: { type: "string" },
      "font-size": { type: "string" },
      force: { type: "boolean", short: "f" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  if (values.help || (!positionals.length && !values.version)) {
    process.stdout.write(help);
    return;
  }
  if (values.version) {
    const pkg = JSON.parse(
      await readFile(new URL("../package.json", import.meta.url), "utf8")
    );
    process.stdout.write(`${pkg.version}\n`);
    return;
  }
  if (positionals.length !== 1) {
    throw new Error(
      "Provide exactly one Mermaid input file, or - for standard input."
    );
  }
  const input = positionals[0];
  const text =
    input === "-" ? await readStdin() : await readFile(resolve(input), "utf8");
  const definition = extractDefinition(text);
  const output = resolve(
    values.output ??
      (input === "-"
        ? "diagram.excalidraw"
        : `${basename(input, extname(input))}.excalidraw`)
  );
  const svg = values.svg ? resolve(values.svg) : undefined;
  if (svg === output) {
    throw new Error("The Excalidraw and SVG output paths must differ.");
  }
  for (const path of [output, svg].filter(Boolean)) {
    if (!values.force && (await exists(path))) {
      throw new Error(
        `Output already exists: ${path}. Use --force to replace it.`
      );
    }
  }
  const config = values.config
    ? JSON.parse(await readFile(resolve(values.config), "utf8"))
    : {};
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Mermaid config must be a JSON object.");
  }
  if (values["font-size"] !== undefined) {
    const fontSize = Number(values["font-size"]);
    if (!Number.isInteger(fontSize) || fontSize <= 0) {
      throw new Error("--font-size must be a positive integer.");
    }
    config.themeVariables = {
      ...config.themeVariables,
      fontSize: `${fontSize}px`,
    };
  }
  const resources = values.resources
    ? await readFile(resolve(values.resources), "utf8")
    : "";
  const result = await renderDiagram({
    definition,
    config,
    resources,
    svg: Boolean(svg),
  });
  for (const [path, contents] of [
    [output, result.json],
    ...(svg ? [[svg, result.svg]] : []),
  ]) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents, { flag: values.force ? "w" : "wx" });
    process.stdout.write(`Created ${path}\n`);
  }
  if (result.imageFallback) {
    console.error(
      "Note: this diagram includes an SVG image fallback; its shapes are not individually editable."
    );
  }
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readStdin() {
  let text = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    text += chunk;
  }
  return text;
}

main().catch((error) => {
  console.error(`mermaid-to-excalidraw: ${error.message}`);
  process.exitCode = 1;
});
