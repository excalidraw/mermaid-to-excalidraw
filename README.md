# mermaid-to-excalidraw

Convert mermaid diagrams to excalidraw

## Setup

Install packages:

```
yarn
```

Start development playground:

```
yarn start # or yarn playground
```

Eslint code test:

```
yarn test:code
```

## Documentation

```ts
function parseMermaid(
  mermaid: Mermaid,
  diagramDefinition: string,
  options?: {
    fontSize: number;
  }
): Graph;

function graphToExcalidraw(
  graph: Graph,
  options?: {
    fontSize: number;
  }
): ExcalidrawElement[];
```

- Default font size is `20`

### Supported features

- Flowcharts Diagram
  - Shape: rectangle, rounded corner, circle, double circle, diamond.
  - Arrow: arrow_circle, arrow_cross, double_arrow_circle, double_arrow_point.
  - Arrow stroke: dotted, thick.
  - Cluster
  - Attached link
  - Entity codes supported.
- Playground
  - Render all flow diagram test cases, Render to Excalidraw canvas, `parseMermaid` data, Excalidraw initial data (see: Devtool Console)
  - Custom Test Input, Custom font size, Error handling.

### Un-supported features

- Unsupported Flowchart Features
  - Markdown strings (Fallback to text)
  - Basic FontAwesome (Fallback to text, ignore icons)
  - Cross arrow
  - Shape: subroutine, cylindrical, asymmetric, hexagon, Parallelogram, Trapezoid, Double circle. (all these shapes will fall back to similar supported shapes, including rectangles, rounds, circles, rhombus.
  - Arrow: double_arrow_cross (fallback to Excalidraw's `bar` arrow type)
  - Custom element style e.g. font family, font color, bg color, stroke color, etc. (fallback to default styling)
- Currently, we support only flowchart diagrams.
