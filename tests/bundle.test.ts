// @vitest-environment node
// (esbuild doesn't run in jsdom)
import path from "node:path";

import { build } from "esbuild";

const ROOT = path.resolve(__dirname, "..");

// The modules each converted diagram type is read and converted with
const DIAGRAM_TYPE_MODULE =
  /^src\/(?:pele|converter\/types)\/(?!svg|elements|parsePele|graphImage)(\w+)\.ts$/;

describe("bundles", () => {
  it("bundles each diagram type's code in its own chunk", async () => {
    const { metafile } = await build({
      entryPoints: [path.join(ROOT, "src/index.ts")],
      bundle: true,
      splitting: true,
      format: "esm",
      outdir: "out",
      write: false,
      metafile: true,
      packages: "external",
      logLevel: "silent",
    });
    const { outputs } = metafile;
    const getTypes = (chunk: string) =>
      Object.keys(outputs[chunk].inputs)
        .map(
          (input) =>
            path
              .relative(ROOT, path.resolve(input))
              .match(DIAGRAM_TYPE_MODULE)?.[1]
        )
        .filter(Boolean);

    // none loaded with `parseMermaidToExcalidraw`: in its chunk, or chunks it
    // imports statically
    const entry = Object.keys(outputs).find(
      (chunk) => outputs[chunk].entryPoint === "src/index.ts"
    )!;
    const loaded = new Set([entry]);
    for (const chunk of loaded) {
      for (const { path, kind } of outputs[chunk].imports) {
        if (kind === "import-statement" && outputs[path]) {
          loaded.add(path);
        }
      }
    }
    expect(
      [...loaded].flatMap(getTypes),
      "diagram types loaded with `parseMermaidToExcalidraw`"
    ).toEqual([]);

    // a chunk per diagram type, with its code only
    const types = Object.keys(outputs).map((chunk) => new Set(getTypes(chunk)));
    for (const chunkTypes of types) {
      expect(chunkTypes.size).toBeLessThanOrEqual(1);
    }
    expect(types.flatMap((chunkTypes) => [...chunkTypes]).sort()).toEqual([
      "class",
      "er",
      "flowchart",
      "gantt",
      "quadrant",
      "sequence",
      "state",
      "timeline",
    ]);
  });
});
