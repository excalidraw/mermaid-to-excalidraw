# mermaid-to-excalidraw

Convert mermaid diagrams to excalidraw

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

The `diagramDefinition` is the mermaid diagram definition.
and `config` is the mermaid config. You can use the `config` param when you want to pass some custom config to mermaid.

Currently `mermaid-to-excalidraw` only supports the :point_down: config params

```ts
{
  /**
   * Whether to start the diagram automatically when the page loads.
   * @default false
   */
  startOnLoad?: boolean;
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
  /**
   * The engine that parses and lays out the diagram (experimental, see below).
   * @default "mermaid"
   */
  engine?: "mermaid" | "pele";
}
```

### Engines (experimental)

By default, diagrams are parsed and laid out by [Mermaid](https://mermaid.js.org), rendered in the DOM. With `engine: "pele"`, they're parsed and laid out by [Pele](https://pele.run), which reads the same Mermaid syntax but needs no DOM. Its layout differs from Mermaid's.

Like the Mermaid engine, it converts flowcharts, sequence, class, ER and state diagrams to Excalidraw elements, and inserts other diagram types as an image.

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
  - `?engine=pele` (or the `Engine` button / <kbd>e</kbd> / <kbd>Tab</kbd>) switches the engine
- `VISUAL_TESTS_ENGINES=mermaid,pele yarn test:visual` to also run visual tests with the Pele engine (its snapshots are prefixed with `pele-`)

## API

Head over to the [docs](https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/api).

## Support new Diagram type

Head over to the [docs](https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/codebase/new-diagram-type).
