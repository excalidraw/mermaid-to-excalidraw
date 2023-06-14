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

## Documentation

```ts
// Un-supported diagram will render as SVG image (GraphImage)
function parseMermaid(
  mermaid: Mermaid,
  diagramDefinition: string,
  options?: {
    fontSize: number;
  }
): Graph | GraphImage;

interface GraphToExcalidrawResult {
  elements: ExcalidrawElement[];
  files?: BinaryFiles;
}
function graphToExcalidraw(
  graph: Graph | GraphImage,
  options?: {
    fontSize: number;
  }
): GraphToExcalidrawResult;
```

- Default font size is `20`

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
  - Basic FontAwesome (Fallback to text, ignore icons)
  - Cross arrow (Fallback to Excalidraw's `bar` arrow type)
  - Shape: subroutine, cylindrical, asymmetric, hexagon, Parallelogram, Trapezoid (all these shapes will fall back to similar supported shapes, including rectangles, rounds, rhombus.)
  - Arrow: double_arrow_cross (fallback to Excalidraw's `bar` arrow type)
  - Custom element style e.g. font family, font color, bg color, stroke color, etc. (fallback to default styling)
- Currently, we support only flowchart diagrams.
