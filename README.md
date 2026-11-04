# mermaid-to-excalidraw

Convert mermaid diagrams to excalidraw

Diagrams are parsed and laid out by [Pele](https://pele.run), which reads Mermaid syntax and lays diagrams out without rendering them in the DOM (since v3; v2 used [Mermaid](https://mermaid.js.org) itself, see [Upgrading from v2](#upgrading-from-v2)).

## Set up

Install packages:

```
yarn
```

Start development playground:

```
yarn start
```

Build command:

```
yarn build
```

## Command line

The CLI converts a Mermaid file into an `.excalidraw` file you can open and edit.
It runs a local headless Chromium browser and closes it when the export finishes.
Node.js 18 or newer is required.

From this project folder, set it up once:

```sh
yarn install
npx playwright install chromium
yarn build
npm link --ignore-scripts
```

You can then run the command from any folder:

```sh
mermaid-to-excalidraw diagram.mmd -o diagram.excalidraw
```

Without `-o`, the output uses the input filename with an `.excalidraw` extension,
saved in your current folder. You can also run it without a global link:

```sh
node /absolute/path/to/mermaid-to-excalidraw/cli/index.mjs diagram.mmd
# Or, from the project folder:
yarn cli diagram.mmd
```

The input can be raw Mermaid or a Markdown file containing one fenced `mermaid`
block. Multiple Mermaid blocks are rejected so each output contains one diagram.

```sh
# Include an editable resource list beside the diagram and export an SVG preview:
mermaid-to-excalidraw diagram.mmd --resources resources.md --svg diagram.svg

# Read from a pipe:
cat diagram.mmd | mermaid-to-excalidraw - -o diagram.excalidraw

# Set the diagram font size:
mermaid-to-excalidraw diagram.mmd --font-size 24

# Pass a Mermaid configuration JSON file:
mermaid-to-excalidraw diagram.mmd --config mermaid-config.json

# Replace an existing output:
mermaid-to-excalidraw diagram.mmd --force

mermaid-to-excalidraw --help
```

`--resources` accepts text or Markdown. It adds an editable text block, preserving
the resource IDs and file paths. Mermaid code fences are removed from that block,
so a Markdown file containing both the diagram and its resource list can be used
as both input and `--resources`. This option renders text rather than a rich
Markdown table.

For flowchart node colors, use Mermaid's `classDef`, `class`, and `style` directives:

```mermaid
flowchart LR
    A[Workshop] --> B[Shared calculations]
    classDef workshop fill:#d0ebff,stroke:#1864ab,color:#1864ab;
    classDef shared fill:#ffec99,stroke:#a65f00,color:#a65f00;
    class A workshop;
    class B shared;
```

Flowcharts, sequence diagrams, class diagrams, ER diagrams, and state diagrams
have converters for editable shapes. Other diagram types and some unsupported
features can fall back to an SVG image; the CLI reports when that happens.
Some Mermaid styles, including custom edge colors, are not currently converted.

After changing the converter or CLI browser code, run `yarn build` again.
`yarn test:cli` checks exports from another working folder, colors, resource
lists, piped input, errors, and overwrite behavior.

## Library API

```ts
parseMermaidToExcalidraw(diagramDefinition: string, config?: MermaidConfig)
```

The `diagramDefinition` is the mermaid diagram definition, and `config` is the mermaid config. `mermaid-to-excalidraw` only supports the :point_down: config params

```ts
{
  /**
   * Whether flowchart edges and state transitions are drawn as elbow arrows
   * (routed orthogonally): for both, or per diagram type. A curve set in the
   * definition (front matter, `%%{init}%%`) wins. Swimlanes' edges are always
   * elbow arrows.
   * @default false
   */
  elbow?: boolean | { flowchart?: boolean; state?: boolean };
  /**
   * Theme variables
   * @default { fontSize: "20px" }
   */
  themeVariables?: {
    fontSize?: string;
  };
  /**
   * Maximum number of edges to be rendered.
   * @default 500
   */
  maxEdges?: number;
  /**
   * Maximum number of characters to be rendered.
   * @default 50000
   */
  maxTextSize?: number;
}
```

Flowcharts (including `swimlane-beta` diagrams), sequence, class, ER and state diagrams are converted to Excalidraw elements. Other diagram types Pele supports are inserted as an image.

It needs DOM APIs (e.g. `DOMParser`, so a browser, or jsdom), but nothing is rendered into the document.

Example code:

```ts
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";

try {
  const { elements, files } = await parseMermaidToExcalidraw(
    diagramDefinition,
    {
      themeVariables: {
        fontSize: "25px",
      },
    }
  );
  // Render elements and files on Excalidraw
} catch (e) {
  // Parse error, displaying error message to users
}
```

## Playground

Try out [here](https://mermaid-to-excalidraw.vercel.app).

## Development

- `yarn test:visual` to run visual tests
- `yarn test:visual:update` to update visual tests
- `yarn test:visual:dev` to run visual test dev server (usually better to use this over the playground)

Test cases are Mermaid files in [`testcases/`](testcases/testcases.ts), named `<type>-<name>.mmd` (`flowchart`, `sequence`, `class`, `erd`, `state`, `unsupported`, `swimlane`):

- `testcases/features/`: one syntax feature each. The playground lists them, the visual tests snapshot each one (named after the file), and the unit tests parse them. Add a case as a new file; renaming one renames its snapshot.
- `testcases/examples/`: whole diagrams models wrote for the prompts in [`prompts.md`](testcases/examples/prompts.md), with the model and prompt in `%%` comments at the top.

## Upgrading from v2

- Diagrams are laid out by Pele instead of Mermaid, so they look different (e.g. node sizes and spacing, edge routes), and Mermaid is no longer a dependency. `parseMermaidToExcalidraw` is the same otherwise.
- The `engine` and `startOnLoad` config params are gone.
- Diagrams that Mermaid parsed but Pele doesn't now throw a parse error (Pele's errors follow Mermaid's format).
- Known gap: `<br>` and `\n` in class members are drawn as is (Pele lays members out on one line).

v2 is maintained on the [`release/2.x`](https://github.com/excalidraw/mermaid-to-excalidraw/tree/release/2.x) branch.

## API

Head over to the [docs](https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/api).

## Support new Diagram type

Head over to the [docs](https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/codebase/new-diagram-type).
