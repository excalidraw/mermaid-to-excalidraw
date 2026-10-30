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

## Get started

```ts
parseMermaidToExcalidraw(diagramDefinition: string, config?: MermaidConfig)
```

The `diagramDefinition` is the mermaid diagram definition, and `config` is the mermaid config. `mermaid-to-excalidraw` only supports the :point_down: config params

```ts
{
  /**
   * The flowchart curve style.
   * @default "linear"
   */
  flowchart?: {
    curve?: "linear" | "basis";
  };
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
