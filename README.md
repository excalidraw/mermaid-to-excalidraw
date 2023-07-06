# mermaid-to-excalidraw

Convert mermaid diagrams to excalidraw

## Setup

Install packages:

```
yarn
```

Start development playground:

```
yarn start:playground
```

Eslint code test:

```
yarn test:code
```

## Get started

Example code:

```ts
import {
  parseMermaid,
  graphToExcalidraw,
} from "@excalidraw/mermaid-to-excalidraw";

let mermaidGraphData;
try {
  mermaidGraphData = await parseMermaid(mermaid, diagramDefinition, {
    fontSize: DEFAULT_FONT_SIZE,
  });
} catch (e) {
  // Parse error, displaying error message to users
}

const { elements, files } = graphToExcalidraw(mermaidGraphData);

// Render elements and files on Excalidraw
```

## API

### parseMermaid

Takes `mermaid`, `diagramDefinition`, and optional `options` as inputs, and return either a `Graph` or `GraphImage`. If the diagram is unsupported, it renders as an SVG image (GraphImage).

**_Signature_**

```ts
function parseMermaid(
  mermaid: Mermaid,
  diagramDefinition: string,
  options?: {
    fontSize: number; // default 20
  }
): Graph | GraphImage;
```

**How to use**

```ts
import { parseMermaid } from "@excalidraw/mermaid-to-excalidraw";
```

### graphToExcalidraw

Takes a `Graph` or `GraphImage` and optional `options` as inputs, and returns `elements` and optionally `files`.

**_Signature_**

```ts
function graphToExcalidraw(
  graph: Graph | GraphImage,
  options?: {
    fontSize: number;
  }
): {
  elements: ExcalidrawElement[];
  files?: BinaryFiles;
};
```

**How to use**

```ts
import { graphToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
```

## Playground

[Open Playground](https://mermaid-to-excalidraw.vercel.app)

- Additional Notes
  - If you're clicking the "Render to Excalidraw" button on the same diagram multiple times, you may notice a slight change of elements stroke on the Excalidraw diagram. This occurs as a result of the randomness featured in the libraries used by Excalidraw, specifically Rough.js.

## Features

### Supported features

- Flowcharts Diagram
  - Shape: rectangle, rounded corner, circle, double circle, diamond.
    ![](./images/example-shape.png)
  - Arrow: arrow_circle, arrow_cross, double_arrow_circle, double_arrow_point.
    ![](./images/example-arrow-type.png)
  - Arrow stroke: dotted, thick.
    ![](./images/example-arrow-style.png)
  - Cluster
    ![](./images/example-cluster.png)
  - Entity codes supported.
    ![](./images/example-entity-code.png)
  - Attached link
- Playground
  - Render all flow diagram test cases, Render to Excalidraw canvas, `parseMermaid` data, Excalidraw initial data (see: Devtool Console)
  - Custom Test Input, Custom font size, Error handling.

### Un-supported features

- Unsupported Flowchart Features
  - Markdown strings (Fallback to text)
    ![](./images/unsupported/markdown.png)
  - Basic FontAwesome (Fallback to text, ignore icons)
    ![](./images/unsupported/fontawesome.png)
  - Cross arrow (Fallback to Excalidraw's `bar` arrow type)
  - Arrow: double_arrow_cross (fallback to Excalidraw's `bar` arrow type)
    ![](./images/unsupported/cross-arrow.png)
  - Shape: subroutine, cylindrical, asymmetric, hexagon, Parallelogram, Trapezoid (all these shapes will fall back to similar supported shapes, including rectangles, rounds, rhombus.)
    ![](./images/unsupported/shapes.png)
  - Custom style from CSS classname
- Unsupported diagram will be rendered as SVG image, For example:
<table>
  <tr>
    <th>
      <pre>
gantt
  title A Gantt Diagram
  dateFormat  YYYY-MM-DD
  section Section
  A task           :a1, 2014-01-01, 30d
  Another task     :after a1  , 20d
  section Another
  Task in sec      :2014-01-12  , 12d
  another task      : 24d
      </pre>
    </th>
    <th>
       <img src="./images/unsupported/gantt.png"/>
    </th>
  </tr>
  <tr>
    <th>
      <pre>
erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains
  CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
      </pre>
    </th>
    <th>
       <img src="./images/unsupported/erdiagram.png"/>
    </th>
  </tr>
</table>
