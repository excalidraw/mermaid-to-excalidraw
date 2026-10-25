import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parseMermaid } from "../src/parseMermaid.js";
import { DEFAULT_FONT_SIZE } from "../src/constants.js";
import { isValidCSSColor } from "../src/parser/cssUtils.js";
import { CLASS_DIAGRAM_TESTCASES } from "../playground/testcases/class.ts";
import { ERD_DIAGRAM_TESTCASES } from "../playground/testcases/er.ts";
import { FLOWCHART_DIAGRAM_TESTCASES } from "../playground/testcases/flowchart.ts";
import { SEQUENCE_DIAGRAM_TESTCASES } from "../playground/testcases/sequence.ts";
import { STATE_DIAGRAM_TESTCASES } from "../playground/testcases/state.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "../playground/testcases/unsupported.ts";
import { LINE_BREAK_TESTCASES } from "../playground/testcases/lineBreaks.ts";

const PLAYGROUND_TESTCASES = [
  ...FLOWCHART_DIAGRAM_TESTCASES,
  ...SEQUENCE_DIAGRAM_TESTCASES,
  ...CLASS_DIAGRAM_TESTCASES,
  ...ERD_DIAGRAM_TESTCASES,
  ...STATE_DIAGRAM_TESTCASES,
  ...UNSUPPORTED_DIAGRAM_TESTCASES,
  ...LINE_BREAK_TESTCASES,
];

type BBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ColorEntry = {
  path: string;
  value: string;
};

const zeroBox = (): BBox => ({ x: 0, y: 0, width: 0, height: 0 });

const numberAttr = (element: Element, attribute: string, fallback = 0) => {
  const rawValue = element.getAttribute(attribute);
  return rawValue === null ? fallback : Number(rawValue);
};

const unionBoxes = (boxes: BBox[]): BBox => {
  if (boxes.length === 0) {
    return zeroBox();
  }

  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const parsePointsBox = (points: string | null): BBox => {
  if (!points) {
    return zeroBox();
  }

  const coordinates = points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map((value) => Number(value)))
    .filter(
      (pair): pair is [number, number] =>
        pair.length === 2 &&
        Number.isFinite(pair[0]) &&
        Number.isFinite(pair[1])
    );

  if (coordinates.length === 0) {
    return zeroBox();
  }

  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const parsePathBox = (pathData: string | null): BBox => {
  if (!pathData) {
    return zeroBox();
  }

  const numericTokens = Array.from(
    pathData.matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi),
    (match) => Number(match[0])
  );

  if (numericTokens.length < 2) {
    return zeroBox();
  }

  const coordinates: Array<[number, number]> = [];
  for (let index = 0; index < numericTokens.length - 1; index += 2) {
    coordinates.push([numericTokens[index], numericTokens[index + 1]]);
  }

  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getMockBBox = (element: SVGElement): BBox => {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case "rect":
    case "foreignobject":
    case "image":
      return {
        x: numberAttr(element, "x"),
        y: numberAttr(element, "y"),
        width: numberAttr(element, "width"),
        height: numberAttr(element, "height"),
      };
    case "circle": {
      const r = numberAttr(element, "r");
      const cx = numberAttr(element, "cx");
      const cy = numberAttr(element, "cy");
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    case "ellipse": {
      const rx = numberAttr(element, "rx");
      const ry = numberAttr(element, "ry");
      const cx = numberAttr(element, "cx");
      const cy = numberAttr(element, "cy");
      return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 };
    }
    case "line": {
      const x1 = numberAttr(element, "x1");
      const y1 = numberAttr(element, "y1");
      const x2 = numberAttr(element, "x2");
      const y2 = numberAttr(element, "y2");
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };
    }
    case "polygon":
    case "polyline":
      return parsePointsBox(element.getAttribute("points"));
    case "path":
      return parsePathBox(element.getAttribute("d"));
    case "text":
    case "tspan": {
      const x = numberAttr(element, "x");
      const y = numberAttr(element, "y");
      const text = element.textContent ?? "";
      return {
        x,
        y,
        width: Math.max(text.length * 8, 1),
        height: 16,
      };
    }
    default: {
      const childBoxes = Array.from(element.children)
        .filter((child): child is SVGElement => child instanceof SVGElement)
        .map((child) => getMockBBox(child))
        .filter((box) => box.width > 0 || box.height > 0);

      return unionBoxes(childBoxes);
    }
  }
};

const collectColorEntries = (elements: any[]): ColorEntry[] => {
  const entries: ColorEntry[] = [];

  elements.forEach((element, index) => {
    if (
      element.type === "text" &&
      typeof element.strokeColor === "string" &&
      element.strokeColor
    ) {
      entries.push({
        path: `elements[${index}].strokeColor`,
        value: element.strokeColor,
      });
    } else if (typeof element.strokeColor === "string" && element.strokeColor) {
      entries.push({
        path: `elements[${index}].strokeColor`,
        value: element.strokeColor,
      });
    }

    if (
      typeof element.backgroundColor === "string" &&
      element.backgroundColor
    ) {
      entries.push({
        path: `elements[${index}].backgroundColor`,
        value: element.backgroundColor,
      });
    }

    if (
      element.label &&
      typeof element.label.strokeColor === "string" &&
      element.label.strokeColor
    ) {
      entries.push({
        path: `elements[${index}].label.strokeColor`,
        value: element.label.strokeColor,
      });
    }
  });

  return entries;
};

const getAbsoluteLinearPoints = (element: any): Array<[number, number]> => {
  const points =
    Array.isArray(element?.points) && element.points.length
      ? element.points
      : [
          [0, 0],
          [element?.width ?? 0, element?.height ?? 0],
        ];

  return points.map(
    ([x, y]: [number, number]) =>
      [Number(element?.x ?? 0) + x, Number(element?.y ?? 0) + y] as [
        number,
        number
      ]
  );
};

const isPointNearRectangle = (
  [x, y]: [number, number],
  rectangle: { x: number; y: number; width: number; height: number },
  tolerance = 24
) => {
  return (
    x >= rectangle.x - tolerance &&
    x <= rectangle.x + rectangle.width + tolerance &&
    y >= rectangle.y - tolerance &&
    y <= rectangle.y + rectangle.height + tolerance
  );
};

const isPointInsideRectangleInterior = (
  [x, y]: [number, number],
  rectangle: { x: number; y: number; width: number; height: number },
  inset = 4
) => {
  return (
    x > rectangle.x + inset &&
    x < rectangle.x + rectangle.width - inset &&
    y > rectangle.y + inset &&
    y < rectangle.y + rectangle.height - inset
  );
};

const distanceToRectangleOutline = (
  [x, y]: [number, number],
  rectangle: { x: number; y: number; width: number; height: number }
) => {
  const left = rectangle.x;
  const right = rectangle.x + rectangle.width;
  const top = rectangle.y;
  const bottom = rectangle.y + rectangle.height;

  const deltaX =
    x < left ? left - x : x > right ? x - right : Math.min(x - left, right - x);
  const deltaY =
    y < top ? top - y : y > bottom ? y - bottom : Math.min(y - top, bottom - y);

  if (x >= left && x <= right && y >= top && y <= bottom) {
    return Math.min(deltaX, deltaY);
  }

  if (x >= left && x <= right) {
    return deltaY;
  }

  if (y >= top && y <= bottom) {
    return deltaX;
  }

  return Math.hypot(deltaX, deltaY);
};

const hasConsecutiveDuplicatePoints = (
  points: readonly (readonly [number, number])[]
) => {
  return points.some((point, index, array) => {
    if (index === 0) {
      return false;
    }

    const previousPoint = array[index - 1];
    return point[0] === previousPoint[0] && point[1] === previousPoint[1];
  });
};

describe("playground examples", () => {
  const originalGetBBox = SVGElement.prototype.getBBox;
  const originalGetBoundingClientRect =
    SVGElement.prototype.getBoundingClientRect;
  const originalGetComputedTextLength =
    SVGElement.prototype.getComputedTextLength;

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: function getBBox() {
        return getMockBBox(this);
      },
    });

    Object.defineProperty(SVGElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: function getBoundingClientRect() {
        const box = getMockBBox(this);
        return {
          ...box,
          top: box.y,
          right: box.x + box.width,
          bottom: box.y + box.height,
          left: box.x,
          toJSON: () => box,
        };
      },
    });

    Object.defineProperty(SVGElement.prototype, "getComputedTextLength", {
      configurable: true,
      value: function getComputedTextLength() {
        return Math.max((this.textContent ?? "").length * 8, 1);
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: originalGetBBox,
    });

    Object.defineProperty(SVGElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: originalGetBoundingClientRect,
    });

    Object.defineProperty(SVGElement.prototype, "getComputedTextLength", {
      configurable: true,
      value: originalGetComputedTextLength,
    });
  });

  it("preserves separate classDef stroke color and stroke width", async () => {
    const definition = `flowchart LR
    A:::foo & B:::bar --> C:::foobar
    classDef foo stroke:#1971c2, fill:#4dabf7
    classDef bar stroke:#d6336c, fill:#f783ac
    classDef foobar stroke:#00f stroke-width:2px`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("flowchart");

    const flowchart = graph;
    expect(flowchart.vertices.C?.containerStyle.stroke).toBe("#00f");
    expect(flowchart.vertices.C?.containerStyle["stroke-width"]).toBe("2px");
  });

  it("preserves direct flowchart node styling for fill, stroke, dash, and label color", async () => {
    const definition = `flowchart LR
id1(Start)-->id2(Stop)
style id1 fill:#f9f,stroke:#333,stroke-width:4px
style id2 fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("flowchart");

    const flowchart = graph;
    expect(flowchart.vertices.id1?.containerStyle).toMatchObject({
      fill: "#f9f",
      stroke: "#333",
      "stroke-width": "4px",
    });
    expect(flowchart.vertices.id2?.containerStyle).toMatchObject({
      fill: "#bbf",
      stroke: "#f66",
      "stroke-width": "2px",
      "stroke-dasharray": "5 5",
    });
    expect(flowchart.vertices.id2?.labelStyle).toMatchObject({
      color: "#fff",
    });

    const result = graphToExcalidraw(graph);
    const startNode = result.elements.find(
      (element: any) => element.id === "id1"
    );
    const stopNode = result.elements.find(
      (element: any) => element.id === "id2"
    );

    expect(startNode).toMatchObject({
      backgroundColor: "#f9f",
      strokeColor: "#333",
      strokeWidth: 4,
    });
    expect(stopNode).toMatchObject({
      backgroundColor: "#bbf",
      strokeColor: "#f66",
      strokeWidth: 2,
      strokeStyle: "dashed",
      label: {
        strokeColor: "#fff",
      },
    });
  });

  it("shrinks cylindrical flowchart node labels to avoid wrapping", async () => {
    const graph = await parseMermaid(`flowchart LR
id1[(Database)]`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    const node = result.elements.find((element: any) => element.id === "id1");

    expect(node).toMatchObject({
      type: "rectangle",
      label: {
        text: "Database",
      },
    });
    expect(node.label.fontSize).toBeLessThan(DEFAULT_FONT_SIZE);
    expect(node.label.fontSize).toBeGreaterThanOrEqual(12);
  });

  it("shrinks multiline cylindrical labels to fit their longest line", async () => {
    const graph = await parseMermaid(`flowchart LR
id1[(Data<br>base)]`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    const node = result.elements.find((element: any) => element.id === "id1");

    expect(node).toMatchObject({ label: { text: "Data\nbase" } });
    expect(node.label.fontSize).toBeLessThan(DEFAULT_FONT_SIZE);
    expect(node.label.fontSize).toBeGreaterThanOrEqual(12);
  });

  it("keeps the default font size for non-cylindrical flowchart nodes", async () => {
    const graph = await parseMermaid(`flowchart LR
id1[Database]`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    const node = result.elements.find((element: any) => element.id === "id1");

    expect(node).toMatchObject({
      type: "rectangle",
      label: {
        text: "Database",
        fontSize: DEFAULT_FONT_SIZE,
      },
    });
  });

  it("converts flowchart <br> tags to newlines in node and edge labels", async () => {
    const graph = await parseMermaid(`flowchart LR
id1["First line<br>Second line"] -->|"Edge line 1<br/>Edge line 2"| id2["Done"]`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    const node = result.elements.find((element: any) => element.id === "id1");
    const edge = result.elements.find(
      (element: any) => element.id === "id1_id2"
    );

    expect(node).toMatchObject({
      label: {
        text: "First line\nSecond line",
      },
    });
    expect(edge).toMatchObject({
      label: {
        text: "Edge line 1\nEdge line 2",
      },
    });
  });

  it("converts flowchart <br> tags before stripping markdown labels", async () => {
    const graph = await parseMermaid(`flowchart LR
subgraph "One"
a("\`hor<br>se\`") -- "edge label" --> b{{"\`The **dog** in the hog\`"}}
end`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    const horse = result.elements.find((element: any) => element.id === "a");
    const dog = result.elements.find((element: any) => element.id === "b");

    expect(horse).toMatchObject({
      label: {
        text: "hor\nse",
      },
    });
    expect(dog).toMatchObject({
      label: {
        text: "The dog in the hog",
      },
    });
  });

  it("falls back to \\n where Mermaid only parses \\n, not <br>", async () => {
    const flowchart = await parseMermaid(`flowchart TD
subgraph Title<br>two
  A<br>B --> C
end
style A<br>B fill:#ff0000`);
    expect(flowchart.type).toBe("flowchart");
    const flowchartResult = graphToExcalidraw(flowchart);
    expect(
      flowchartResult.elements.find(
        (element: any) =>
          element.type === "rectangle" && element.label?.text === "A\nB"
      )
    ).toMatchObject({ backgroundColor: "#ff0000" });
    expect(
      flowchartResult.elements.some(
        (element: any) => element.label?.text === "Title\ntwo"
      )
    ).toBe(true);

    const sequence = await parseMermaid(`sequenceDiagram
participant A<br>B
A<br>B->>C: hello<br>there`);
    expect(sequence.type).toBe("sequence");
    expect(
      graphToExcalidraw(sequence).elements.map(
        (element: any) => element.label?.text ?? element.text
      )
    ).toEqual(expect.arrayContaining(["A\nB", "hello\nthere"]));
  });

  it("reports the original error when neither line break syntax parses", async () => {
    await expect(
      parseMermaid(`classDiagram
class A<br>B`)
    ).rejects.toThrow(/<br>/);
  });

  it("converts flowchart line break syntax in bare node ids", async () => {
    const graph = await parseMermaid(`flowchart TD
Start --> St\\nop`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    expect(result.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.objectContaining({ text: "Start" }),
        }),
        expect.objectContaining({
          label: expect.objectContaining({ text: "St\nop" }),
        }),
      ])
    );
  });

  it("does not turn flowchart comments or long edge labels into nodes", async () => {
    const graph = await parseMermaid(`flowchart LR
%% ignored<br>comment\\ntext
A -- Edge<br>Label --> B`);
    expect(graph.type).toBe("flowchart");
    expect(Object.keys(graph.vertices)).toEqual(["A", "B"]);

    const result = graphToExcalidraw(graph);
    const rectangles = result.elements.filter(
      (element: any) => element.type === "rectangle"
    );
    const arrows = result.elements.filter(
      (element: any) => element.type === "arrow"
    );

    expect(rectangles).toHaveLength(2);
    expect(arrows).toHaveLength(1);
    expect(arrows[0]).toMatchObject({
      label: { text: "Edge\nLabel" },
    });
  });

  it("preserves escaped line break text and escaped HTML tags", async () => {
    const graph = await parseMermaid(`flowchart LR
A[Break\\nHere] --> B[Literal\\\\nText] --> C[one&lt;br&gt;two]`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    expect(
      result.elements
        .filter((element: any) => element.type === "rectangle")
        .map((element: any) => element.label?.text)
    ).toEqual(["Break\nHere", "Literal\\nText", "one<br>two"]);
  });

  it("keeps styles and links attached to bare multiline node ids", async () => {
    const graph = await parseMermaid(`flowchart TD
A\\nB --> C
style A\\nB fill:#ff0000
click A\\nB "https://example.com/a"`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    expect(
      result.elements.find(
        (element: any) =>
          element.type === "rectangle" && element.label?.text === "A\nB"
      )
    ).toMatchObject({
      label: { text: "A\nB" },
      backgroundColor: "#ff0000",
    });
  });

  it("renders multiline subgraph titles without creating phantom nodes", async () => {
    const graph = await parseMermaid(`flowchart TD
subgraph first [First<br>Second]
  A --> B
end`);
    expect(graph.type).toBe("flowchart");
    expect(graph.subGraphs).toHaveLength(1);
    expect(Object.keys(graph.vertices)).toEqual(["A", "B"]);

    const result = graphToExcalidraw(graph);
    const subgraph = result.elements.find(
      (element: any) => element.id === graph.subGraphs[0].id
    );

    // the title is on a separate band, above the edges
    const title = result.elements.find(
      (element: any) => element.id === `${graph.subGraphs[0].id}__title`
    );
    expect(subgraph.label).toBeUndefined();
    expect(title).toMatchObject({
      label: { text: "First\nSecond" },
    });
    expect(title.label.fontSize).toBeLessThanOrEqual(DEFAULT_FONT_SIZE);

    const children = graph.subGraphs[0].nodeIds
      .map((nodeId) =>
        result.elements.find((element: any) => element.id === nodeId)
      )
      .filter(Boolean) as any[];
    const childTop = Math.min(...children.map((element) => element.y));
    const labelHeight =
      title.label.text.split("\n").length * title.label.fontSize * 1.25;
    expect(childTop).toBeGreaterThanOrEqual(subgraph.y + labelHeight + 10);
    expect(subgraph.y + subgraph.height).toBeGreaterThanOrEqual(
      Math.max(...children.map((element) => element.y + element.height))
    );
  });

  it("preserves Mermaid's arrowhead clearance for unchanged subgraphs", async () => {
    const graph = await parseMermaid(`flowchart TB
subgraph one
  a1 --> a2
end
subgraph two
  b1 --> b2
end
one --> two`);
    expect(graph.type).toBe("flowchart");

    const parsedEdge = graph.edges.find(
      (edge) => edge.start === "one" && edge.end === "two"
    )!;
    const result = graphToExcalidraw(graph);
    const arrow = result.elements.find(
      (element: any) =>
        element.type === "arrow" &&
        element.start?.id === "one" &&
        element.end?.id === "two"
    ) as any;
    const routePoints = getAbsoluteLinearPoints(arrow);

    expect(routePoints).toHaveLength(parsedEdge.reflectionPoints.length);
    routePoints.forEach((point, index) => {
      expect(point[0]).toBeCloseTo(parsedEdge.reflectionPoints[index].x);
      expect(point[1]).toBeCloseTo(parsedEdge.reflectionPoints[index].y);
    });
  });

  it("expands subgraphs for arbitrarily tall multiline titles", async () => {
    const graph = await parseMermaid(`flowchart TD
subgraph tall [One<br>Two<br>Three<br>Four<br>Five<br>Six<br>Seven<br>Eight<br>Nine<br>Ten]
  A --> B
end`);
    expect(graph.type).toBe("flowchart");

    const originalEdge = graph.edges[0];
    const originalNodeTop = graph.vertices.A!.y;
    const result = graphToExcalidraw(graph);
    const subgraph = result.elements.find(
      (element: any) => element.id === graph.subGraphs[0].id
    ) as any;
    const nodeA = result.elements.find(
      (element: any) => element.id === "A"
    ) as any;
    const nodeB = result.elements.find(
      (element: any) => element.id === "B"
    ) as any;
    const arrow = result.elements.find(
      (element: any) => element.id === "A_B"
    ) as any;

    const title = result.elements.find(
      (element: any) => element.id === `${graph.subGraphs[0].id}__title`
    ) as any;
    expect(title.label.text.split("\n")).toHaveLength(10);
    expect(title.label.fontSize).toBe(DEFAULT_FONT_SIZE);
    const labelBottom =
      subgraph.y +
      title.label.text.split("\n").length * title.label.fontSize * 1.25 +
      10;
    expect(Math.min(nodeA.y, nodeB.y)).toBeGreaterThanOrEqual(labelBottom);
    expect(subgraph.y + subgraph.height).toBeGreaterThanOrEqual(
      Math.max(nodeA.y + nodeA.height, nodeB.y + nodeB.height)
    );

    const verticalShift = nodeA.y - originalNodeTop;
    expect(verticalShift).toBeGreaterThan(0);
    expect(arrow.y - originalEdge.startY).toBeCloseTo(verticalShift);
    expect(arrow.points).toHaveLength(originalEdge.reflectionPoints.length);
    arrow.points.forEach((point: [number, number], index: number) => {
      expect(point[0]).toBeCloseTo(
        originalEdge.reflectionPoints[index].x -
          originalEdge.reflectionPoints[0].x
      );
      expect(point[1]).toBeCloseTo(
        originalEdge.reflectionPoints[index].y -
          originalEdge.reflectionPoints[0].y
      );
    });
  });

  it("keeps edges attached to arbitrarily tall multiline subgraphs", async () => {
    const graph = await parseMermaid(`flowchart TD
subgraph tall [A<br>B<br>C<br>D<br>E<br>F<br>G<br>H<br>I<br>J]
  X --> Y
end
tall --> Z`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    const parsedSubgraph = graph.subGraphs[0];
    const subgraph = result.elements.find(
      (element: any) => element.id === parsedSubgraph.id
    ) as any;
    const arrow = result.elements.find(
      (element: any) =>
        element.type === "arrow" &&
        element.start?.id === parsedSubgraph.id &&
        element.end?.id === "Z"
    ) as any;

    expect(subgraph).toBeTruthy();
    expect(arrow).toBeTruthy();
    const startPoint = getAbsoluteLinearPoints(arrow)[0];
    expect(distanceToRectangleOutline(startPoint, subgraph)).toBeLessThan(1);
    expect(isPointInsideRectangleInterior(startPoint, subgraph)).toBe(false);
  });

  it("reflows nodes and edges around wide multiline subgraph titles", async () => {
    const graph = await parseMermaid(`flowchart LR
subgraph sg [A_very_very_very_very_very_very_long_title<br>Second]
  X --> Y
end
Z --> sg
sg --> Q`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    const subgraph = result.elements.find(
      (element: any) => element.id === "sg"
    ) as any;
    const leftNode = result.elements.find(
      (element: any) => element.id === "Z"
    ) as any;
    const rightNode = result.elements.find(
      (element: any) => element.id === "Q"
    ) as any;
    const incoming = result.elements.find(
      (element: any) => element.type === "arrow" && element.end?.id === "sg"
    ) as any;
    const outgoing = result.elements.find(
      (element: any) => element.type === "arrow" && element.start?.id === "sg"
    ) as any;

    expect(leftNode.x + leftNode.width).toBeLessThanOrEqual(subgraph.x);
    expect(rightNode.x).toBeGreaterThanOrEqual(subgraph.x + subgraph.width);
    const incomingEnd = getAbsoluteLinearPoints(incoming).at(-1)!;
    const outgoingStart = getAbsoluteLinearPoints(outgoing)[0];
    expect(distanceToRectangleOutline(incomingEnd, subgraph)).toBeLessThan(1);
    expect(distanceToRectangleOutline(outgoingStart, subgraph)).toBeLessThan(1);
  });

  it("keeps nested multiline subgraph labels clear of their contents", async () => {
    const graph = await parseMermaid(`flowchart TD
subgraph outer [Outer<br>Group]
  subgraph tall [One<br>Two<br>Three<br>Four<br>Five<br>Six<br>Seven<br>Eight<br>Nine<br>Ten]
    A --> B
  end
  B --> C
end`);
    expect(graph.type).toBe("flowchart");

    const result = graphToExcalidraw(graph);
    graph.subGraphs.forEach((parsedSubgraph) => {
      const subgraph = result.elements.find(
        (element: any) => element.id === parsedSubgraph.id
      ) as any;
      const children = parsedSubgraph.nodeIds
        .map((nodeId) =>
          result.elements.find((element: any) => element.id === nodeId)
        )
        .filter(Boolean) as any[];
      expect(subgraph).toBeTruthy();
      expect(children.length).toBeGreaterThan(0);

      const title = result.elements.find(
        (element: any) => element.id === `${parsedSubgraph.id}__title`
      ) as any;
      const requiredHeaderHeight =
        title.label.text.split("\n").length * title.label.fontSize * 1.25 + 10;
      expect(
        Math.min(...children.map((child) => child.y))
      ).toBeGreaterThanOrEqual(subgraph.y + requiredHeaderHeight);
      expect(subgraph.y + subgraph.height).toBeGreaterThanOrEqual(
        Math.max(...children.map((child) => child.y + child.height))
      );
    });

    result.elements
      .filter((element: any) => element.type === "arrow")
      .forEach((arrow: any) => {
        expect(arrow.points.length).toBeGreaterThanOrEqual(2);
        arrow.points.flat().forEach((coordinate: number) => {
          expect(Number.isFinite(coordinate)).toBe(true);
        });
      });
  });

  it("preserves references to multiline subgraphs and dotted edge labels", async () => {
    const graph = await parseMermaid(`flowchart TD
subgraph foo [Foo<br>Bar]
  A
end
foo --> B
A -. Edge<br>Label .- B`);
    expect(graph.type).toBe("flowchart");
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges.map((edge) => edge.text)).toContain("Edge\nLabel");
  });

  it("preserves line breaks in class aliases", async () => {
    const graph = await parseMermaid(`classDiagram
class Animal["First<br>Second"]`);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    expect(
      result.elements.find((element: any) => element.id === "Animal")
    ).toMatchObject({
      label: { text: "First\nSecond" },
    });
  });

  it("preserves line breaks in class members", async () => {
    const graph = await parseMermaid(`classDiagram
class Animal {
  +first<br>second
}`);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    expect(result.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "text",
          text: "+first\nsecond",
        }),
      ])
    );
  });

  it("preserves line breaks in inline class members", async () => {
    const graph = await parseMermaid(`classDiagram
class Animal["First<br>Second"] { +first<br>second }
class Dog["Good\\nboy"]`);
    expect(graph.type).toBe("class");

    expect(graph.text).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "+first\nsecond" }),
      ])
    );
    const result = graphToExcalidraw(graph);
    expect(
      result.elements.find((element: any) => element.id === "Animal")
    ).toMatchObject({ label: { text: "First\nSecond" } });
    expect(
      result.elements.find((element: any) => element.id === "Dog")
    ).toMatchObject({ label: { text: "Good\nboy" } });
  });

  it("keeps multiline class members at their siblings' font size", async () => {
    const graph = await parseMermaid(`classDiagram
class Animal {
  +first<br>second<br>third
  +other
  +do\\nwork()
  +done()
}`);
    expect(graph.type).toBe("class");

    const textByContent = (text: string) =>
      graph.text.find((element) => element.text === text);
    const firstMember = textByContent("+first\nsecond\nthird");
    const nextMember = textByContent("+other");
    const firstMethod = textByContent("+do\nwork()");
    const nextMethod = textByContent("+done()");
    expect(firstMember).toBeTruthy();
    expect(firstMethod).toBeTruthy();
    expect(firstMember!.fontSize).toBe(nextMember!.fontSize);
    expect(firstMethod!.fontSize).toBe(nextMethod!.fontSize);
  });

  it("shifts downstream class ranks after large multiline expansion", async () => {
    const graph = await parseMermaid(`classDiagram
class A {
  +one<br>two<br>three<br>four<br>five<br>six<br>seven<br>eight<br>nine<br>ten
}
class B {
  +next
}
A --> B`);
    expect(graph.type).toBe("class");

    const baselineGraph = await parseMermaid(`classDiagram
class A {
  +one
}
class B {
  +next
}
A --> B`);
    expect(baselineGraph.type).toBe("class");

    const classA = graph.nodes
      .flat()
      .find((element) => element.type === "rectangle" && element.id === "A");
    const classB = graph.nodes
      .flat()
      .find((element) => element.type === "rectangle" && element.id === "B");
    const baselineClassA = baselineGraph.nodes
      .flat()
      .find((element) => element.type === "rectangle" && element.id === "A");
    const baselineClassB = baselineGraph.nodes
      .flat()
      .find((element) => element.type === "rectangle" && element.id === "B");
    const classBText = graph.text.find((element) => element.text === "+next");
    const relation = graph.arrows.find(
      (arrow) => arrow.start?.id === "A" && arrow.end?.id === "B"
    );

    expect(classA).toBeTruthy();
    expect(classB).toBeTruthy();
    expect(baselineClassA).toBeTruthy();
    expect(baselineClassB).toBeTruthy();
    expect(classBText).toBeTruthy();
    expect(relation).toBeTruthy();
    const originalGap =
      baselineClassB!.y - (baselineClassA!.y + baselineClassA!.height!);
    const expandedGap = classB!.y - (classA!.y + classA!.height!);
    expect(expandedGap).toBeGreaterThanOrEqual(originalGap);
    expect(classBText!.y).toBeGreaterThan(classB!.y);
    expect(relation!.endY).toBeGreaterThan(relation!.startY);
  });

  it("keeps class note connectors attached after multiline rank shifts", async () => {
    const graph = await parseMermaid(`classDiagram
direction TB
class A {
  +one<br>two<br>three<br>four<br>five<br>six<br>seven<br>eight<br>nine<br>ten
}
class B
A --> B
note for B "downstream note"`);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    const classB = result.elements.find(
      (element: any) => element.type === "rectangle" && element.id === "B"
    ) as any;
    const connector = result.elements.find(
      (element: any) =>
        element.type === "arrow" &&
        element.start?.id === "note0" &&
        element.end?.id === "B"
    ) as any;

    expect(classB).toBeTruthy();
    expect(connector).toBeTruthy();
    const connectorPoints = getAbsoluteLinearPoints(connector);
    const endpoint = connectorPoints[connectorPoints.length - 1];
    expect(isPointNearRectangle(endpoint, classB)).toBe(true);
    expect(isPointInsideRectangleInterior(endpoint, classB)).toBe(false);
  });

  it("preserves line breaks in ER entity aliases", async () => {
    const graph = await parseMermaid(`erDiagram
CUSTOMER["First<br>Second"] {
  string name
}`);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);
    const entity = result.elements.find(
      (element: any) =>
        element.type === "rectangle" &&
        String(element.id).startsWith("entity-CUSTOMER-")
    );

    expect(entity).toMatchObject({
      label: { text: "First\nSecond" },
    });
  });

  it("preserves line breaks in ER relationships and attribute comments", async () => {
    const graph = await parseMermaid(`erDiagram
PERSON ||--|| CAR : "owns<br>drives"
PERSON ||--o{ BIKE : "rides\\nsometimes"
PERSON {
  string name "first<br>last"
  string id "unique\\nkey"
}`);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);
    expect(result.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "arrow",
          label: expect.objectContaining({ text: "owns\ndrives" }),
        }),
        expect.objectContaining({
          type: "arrow",
          label: expect.objectContaining({ text: "rides\nsometimes" }),
        }),
        expect.objectContaining({ type: "text", text: "first\nlast" }),
        expect.objectContaining({ type: "text", text: "unique\nkey" }),
      ])
    );
  });

  it("preserves line breaks in inline ER attributes", async () => {
    const graph = await parseMermaid(`erDiagram
PERSON { string name "first<br>last" }`);
    expect(graph.type).toBe("erd");

    expect(graph.text).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: "first\nlast" })])
    );
  });

  it("keeps escaped newlines literal in class and ER fields", async () => {
    const evenRun = "\\".repeat(2);
    const classGraph = await parseMermaid(`classDiagram
class A {
  +even${evenRun}nvalue
}`);
    expect(classGraph.type).toBe("class");
    expect(classGraph.text.map((element) => element.text)).toContain(
      "+even\\nvalue"
    );

    const erGraph = await parseMermaid(`erDiagram
PERSON {
  string even "even${evenRun}nvalue"
}`);
    expect(erGraph.type).toBe("erd");
    expect(erGraph.text.map((element) => element.text)).toContain(
      "even\\nvalue"
    );
  });

  it("uses rectangle labels for class headers while keeping members as text", async () => {
    const definition = `classDiagram
  class Duck
  Duck : +String beakColor
  Duck : +swim()
  class Fish
  Fish : -int sizeInFeet
  Fish : +canEat()
  class Zebra
  Zebra : +bool is_wild
  Zebra : +run()`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    const classRectangles = result.elements.filter(
      (element: any) =>
        element.type === "rectangle" &&
        ["Duck", "Fish", "Zebra"].includes(element.id)
    );

    expect(classRectangles).toHaveLength(3);
    expect(
      classRectangles.map((element: any) => ({
        id: element.id,
        text: element.label?.text,
        verticalAlign: element.label?.verticalAlign,
      }))
    ).toEqual([
      { id: "Duck", text: "Duck", verticalAlign: "top" },
      { id: "Fish", text: "Fish", verticalAlign: "top" },
      { id: "Zebra", text: "Zebra", verticalAlign: "top" },
    ]);

    const textNodes = result.elements
      .filter((element: any) => element.type === "text")
      .map((element: any) => element.text);

    expect(textNodes).not.toContain("Duck");
    expect(textNodes).not.toContain("Fish");
    expect(textNodes).not.toContain("Zebra");
    expect(textNodes).toContain("+String beakColor");
    expect(textNodes).toContain("-int sizeInFeet");
    expect(textNodes).toContain("+bool is_wild");
  });

  it("keeps class relation routing aligned with Mermaid edges when notes are present", async () => {
    const definition = `classDiagram
    class Vehicle
    class Car
    class Engine

    Vehicle <|-- Car : Inheritance
    Vehicle *-- Engine : Composition

    note for Vehicle "Base class"`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    const rectangles = new Map(
      result.elements
        .filter((element: any) => element.type === "rectangle" && element.id)
        .map((element: any) => [element.id, element])
    );

    const inheritanceArrow = result.elements.find(
      (element: any) =>
        element.type === "arrow" &&
        element.label?.text === "Inheritance" &&
        element.start?.id === "Vehicle" &&
        element.end?.id === "Car"
    ) as any;
    const compositionArrow = result.elements.find(
      (element: any) =>
        element.type === "arrow" &&
        element.label?.text === "Composition" &&
        element.start?.id === "Vehicle" &&
        element.end?.id === "Engine"
    ) as any;
    const noteConnector = result.elements.find(
      (element: any) =>
        element.type === "arrow" &&
        element.start?.id === "note0" &&
        element.end?.id === "Vehicle"
    ) as any;

    expect(inheritanceArrow).toBeTruthy();
    expect(compositionArrow).toBeTruthy();
    expect(noteConnector).toBeTruthy();

    expect(inheritanceArrow.strokeStyle).toBe("solid");
    expect(compositionArrow.strokeStyle).toBe("solid");
    expect(noteConnector.strokeStyle).toBe("dotted");

    expect(inheritanceArrow.points.length).toBe(2);
    expect(compositionArrow.points.length).toBe(2);
    expect(noteConnector.points.length).toBeGreaterThanOrEqual(2);

    const inheritancePoints = getAbsoluteLinearPoints(inheritanceArrow);
    const compositionPoints = getAbsoluteLinearPoints(compositionArrow);
    const noteConnectorPoints = getAbsoluteLinearPoints(noteConnector);

    expect(
      isPointNearRectangle(
        inheritancePoints[0],
        rectangles.get("Vehicle") as any
      )
    ).toBe(true);
    expect(
      isPointInsideRectangleInterior(
        inheritancePoints[0],
        rectangles.get("Vehicle") as any
      )
    ).toBe(false);
    expect(
      isPointNearRectangle(
        inheritancePoints[inheritancePoints.length - 1],
        rectangles.get("Car") as any
      )
    ).toBe(true);
    expect(
      isPointInsideRectangleInterior(
        inheritancePoints[inheritancePoints.length - 1],
        rectangles.get("Car") as any
      )
    ).toBe(false);

    expect(
      isPointNearRectangle(
        compositionPoints[0],
        rectangles.get("Vehicle") as any
      )
    ).toBe(true);
    expect(
      isPointInsideRectangleInterior(
        compositionPoints[0],
        rectangles.get("Vehicle") as any
      )
    ).toBe(false);
    expect(
      isPointNearRectangle(
        compositionPoints[compositionPoints.length - 1],
        rectangles.get("Engine") as any
      )
    ).toBe(true);
    expect(
      isPointInsideRectangleInterior(
        compositionPoints[compositionPoints.length - 1],
        rectangles.get("Engine") as any
      )
    ).toBe(false);

    expect(
      isPointNearRectangle(
        noteConnectorPoints[0],
        rectangles.get("note0") as any
      )
    ).toBe(true);
    expect(
      isPointNearRectangle(
        noteConnectorPoints[noteConnectorPoints.length - 1],
        rectangles.get("Vehicle") as any
      )
    ).toBe(true);
    expect(
      isPointInsideRectangleInterior(
        noteConnectorPoints[noteConnectorPoints.length - 1],
        rectangles.get("Vehicle") as any
      )
    ).toBe(false);
  });

  it("simplifies straight class relations to two points while keeping endpoints on the outline", async () => {
    const definition = `classDiagram
    classA <|-- classB
    classC *-- classD
    classE o-- classF
    classG <-- classH`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    const rectangles = new Map(
      result.elements
        .filter((element: any) => element.type === "rectangle" && element.id)
        .map((element: any) => [element.id, element])
    );

    const arrows = result.elements.filter(
      (element: any) => element.type === "arrow"
    ) as any[];

    expect(arrows).toHaveLength(4);

    arrows.forEach((arrow) => {
      expect(arrow.points).toHaveLength(2);

      const absolutePoints = getAbsoluteLinearPoints(arrow);
      const startRectangle = rectangles.get(arrow.start?.id) as any;
      const endRectangle = rectangles.get(arrow.end?.id) as any;

      expect(startRectangle).toBeTruthy();
      expect(endRectangle).toBeTruthy();

      expect(
        distanceToRectangleOutline(absolutePoints[0], startRectangle)
      ).toBeLessThanOrEqual(8);
      expect(
        distanceToRectangleOutline(
          absolutePoints[absolutePoints.length - 1],
          endRectangle
        )
      ).toBeLessThanOrEqual(8);

      expect(
        isPointInsideRectangleInterior(absolutePoints[0], startRectangle)
      ).toBe(false);
      expect(
        isPointInsideRectangleInterior(
          absolutePoints[absolutePoints.length - 1],
          endRectangle
        )
      ).toBe(false);
    });
  });

  it("uses straight connectors for non-self class relations in LR layouts", async () => {
    const definition = `classDiagram
    direction LR
    class Student {
      -idCard : IdCard
    }
    class IdCard{
      -id : int
      -name : string
    }
    class Bike{
      -id : int
      -name : string
    }
    Student "1" --o "1" IdCard : carries
    Student "1" --o "1" Bike : rides`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    const arrows = result.elements.filter(
      (element: any) =>
        element.type === "arrow" &&
        ["carries", "rides"].includes(element.label?.text)
    ) as any[];

    expect(arrows).toHaveLength(2);
    arrows.forEach((arrow) => {
      expect(arrow.points).toHaveLength(2);
    });
  });

  it("merges self-referencing class relations into a single loop and emits multiplicities once per endpoint", async () => {
    const definition = `classDiagram
    class Snake {
      +Integer length
    }
    Snake "1" -- "1" Snake : eats`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);
    const snake = result.elements.find(
      (element: any) => element.type === "rectangle" && element.id === "Snake"
    ) as any;
    const loopArrow = result.elements.find(
      (element: any) =>
        element.type === "arrow" &&
        element.label?.text === "eats" &&
        element.start?.id === "Snake" &&
        element.end?.id === "Snake"
    ) as any;
    const multiplicityTexts = result.elements.filter(
      (element: any) => element.type === "text" && element.text === "1"
    ) as any[];

    expect(snake).toBeTruthy();
    expect(loopArrow).toBeTruthy();
    expect(multiplicityTexts).toHaveLength(2);
    expect(loopArrow.points.length).toBeGreaterThan(4);
    expect(hasConsecutiveDuplicatePoints(loopArrow.points)).toBe(false);
    expect(
      multiplicityTexts.every((element) => element.y > snake.y + snake.height)
    ).toBe(true);

    const loopPoints = getAbsoluteLinearPoints(loopArrow);
    const xs = loopPoints.map(([x]) => x);
    const ys = loopPoints.map(([, y]) => y);

    expect(Math.min(...xs)).toBeLessThan(snake.x);
    expect(Math.max(...xs)).toBeGreaterThan(snake.x + snake.width);
    expect(Math.max(...ys)).toBeGreaterThan(snake.y + snake.height);
  });

  it("preserves styled class text colors from direct style declarations", async () => {
    const definition = `classDiagram
    class User {
        +String username
        +String email
        +login()
        +logout()
    }

    class Profile {
        +String bio
        +String avatarUrl
        +updateProfile()
    }

    class Post {
        +int id
        +String content
        +DateTime createdAt
        +publish()
    }

    class Comment {
        +String text
        +submit()
    }

    User "1" -- "1" Profile : has
    User "1" -- "*" Post : creates
    Post "1" -- "*" Comment : contains
    User "1" -- "*" Comment : writes

    style User fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style Profile fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    style Post fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
    style Comment fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("class");

    const result = graphToExcalidraw(graph);

    expect(
      result.elements.find(
        (element: any) => element.type === "rectangle" && element.id === "User"
      )
    ).toMatchObject({
      strokeColor: "#01579b",
      label: {
        strokeColor: "#01579b",
      },
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" &&
          String(element.text).includes("+String username")
      )
    ).toMatchObject({
      strokeColor: "#01579b",
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" &&
          String(element.text).includes("+String bio")
      )
    ).toMatchObject({
      strokeColor: "#4a148c",
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" && String(element.text).includes("+publish()")
      )
    ).toMatchObject({
      strokeColor: "#1b5e20",
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" && String(element.text).includes("+submit()")
      )
    ).toMatchObject({
      strokeColor: "#e65100",
    });
  });

  it("uses centered container labels for ERD entity headers while keeping attributes as text", async () => {
    const definition = `erDiagram
  PERSON ||--o{ CAR : owns
  PERSON {
    string driversLicense PK "The license #"
    string firstName
    string lastName
  }
  CAR {
    string registrationNumber PK
    string model
  }`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);
    const entityRectangles = result.elements.filter(
      (element: any) => element.type === "rectangle"
    );

    expect(entityRectangles.length).toBeGreaterThanOrEqual(2);

    const personRectangle = entityRectangles.find((element: any) =>
      String(element.id).startsWith("entity-PERSON-")
    );

    expect(personRectangle).toMatchObject({
      label: {
        text: "PERSON",
        textAlign: "center",
        verticalAlign: "top",
      },
    });

    const textNodes = result.elements
      .filter((element: any) => element.type === "text")
      .map((element: any) => element.text);

    expect(textNodes).not.toContain("PERSON");
    expect(textNodes).toContain("driversLicense");
    expect(textNodes).toContain("registrationNumber");
    expect(textNodes).toContain("The license #");
  });

  it("does not assign text colors to unstyled sequence diagrams", async () => {
    const definition = `sequenceDiagram
  actor Alice
  actor Bob
  Alice->>Bob: Hi Bob
  Bob->>Alice: Hi Alice`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("sequence");

    const result = graphToExcalidraw(graph);
    const textElements = result.elements.filter(
      (element: any) => element.type === "text"
    );

    expect(textElements.length).toBeGreaterThan(0);
    textElements.forEach((element: any) => {
      expect(element.strokeColor).toBeUndefined();
    });
  });

  it("preserves line breaks in sequence actors, messages, and notes", async () => {
    const graph = await parseMermaid(`sequenceDiagram
box First<br>Second
participant A as First\\nSecond
participant B
end
A->>B: Edge<br>Label
Note over A,B: Note\\nBody`);
    expect(graph.type).toBe("sequence");

    const result = graphToExcalidraw(graph);
    const labels = result.elements
      .map((element: any) => element.label?.text)
      .filter(Boolean);

    expect(labels).toEqual(
      expect.arrayContaining(["First\nSecond", "Edge\nLabel", "Note\nBody"])
    );

    const groupLabel = result.elements.find(
      (element: any) =>
        element.type === "text" && element.text === "First\nSecond"
    );
    expect(groupLabel).toMatchObject({
      width: 58,
      height: 40,
    });

    const groupRect = result.elements.find(
      (element: any) =>
        element.type === "rectangle" &&
        !element.label?.text &&
        element.x <= groupLabel.x &&
        element.x + element.width >= groupLabel.x + groupLabel.width
    ) as any;
    expect(groupRect).toBeTruthy();
    // not grouped: Excalidraw would keep a group's elements together in
    // z-order, under highlights drawn over the box
    result.elements.forEach((element: any) =>
      expect(element.groupIds ?? []).toEqual([])
    );
    expect(groupLabel.y).toBeGreaterThanOrEqual(groupRect.y);
    expect(groupLabel.y + groupLabel.height).toBeLessThanOrEqual(
      groupRect.y + groupRect.height
    );
  });

  it("expands sequence participant rows for tall multiline labels", async () => {
    const graph = await parseMermaid(`sequenceDiagram
participant A as A<br>B<br>C<br>D
participant Z
A->>Z: hello`);
    expect(graph.type).toBe("sequence");

    const result = graphToExcalidraw(graph);
    const topActor = result.elements.find(
      (element: any) => element.id === "A-top"
    ) as any;
    const bottomActor = result.elements.find(
      (element: any) => element.id === "A-bottom"
    ) as any;
    const message = result.elements.find(
      (element: any) => element.type === "arrow"
    ) as any;
    const lifeline = result.elements.find(
      (element: any) =>
        element.type === "line" && element.x === topActor.x + topActor.width / 2
    ) as any;

    expect(topActor.height).toBeGreaterThanOrEqual(90);
    expect(lifeline.y).toBe(topActor.y + topActor.height);
    expect(message.y).toBeGreaterThan(topActor.y + topActor.height);
    expect(bottomActor.y).toBeGreaterThan(message.y);
  });

  it("keeps tall sequence messages in Mermaid's reserved vertical space", async () => {
    const graph = await parseMermaid(`sequenceDiagram
participant A
participant B
A->>B: A<br>B<br>C<br>D<br>E<br>F<br>G<br>H<br>I<br>J
Note over A,B: next note
B->>A: second`);
    expect(graph.type).toBe("sequence");

    const result = graphToExcalidraw(graph);
    const firstMessage = result.elements.find(
      (element: any) =>
        element.type === "arrow" && element.label?.text.startsWith("A\nB")
    ) as any;
    const note = result.elements.find(
      (element: any) =>
        element.type === "rectangle" && element.label?.text === "next note"
    ) as any;
    const labelHeight = 10 * 16 * 1.25;

    expect(firstMessage).toBeTruthy();
    expect(note).toBeTruthy();
    expect(firstMessage.y + labelHeight / 2).toBeLessThanOrEqual(note.y);
  });

  it("matches nested sequence frame labels to their rendered positions", async () => {
    const graph = await parseMermaid(`sequenceDiagram
participant A
participant B
alt Outer<br>First
loop Inner\\nLoop
A->>B: x
end
else Outer<br>Second
critical Critical<br>Main
B-->>A: y
option Critical\\nFallback
A->>B: z
end
end`);
    expect(graph.type).toBe("sequence");

    expect(
      graph.loops?.texts
        .slice()
        .sort((left, right) => left.y - right.y)
        .map((text) => text.text)
    ).toEqual([
      "[Outer\nFirst]",
      "[Inner\nLoop]",
      "[Outer\nSecond]",
      "[Critical\nMain]",
      "[Critical\nFallback]",
    ]);
  });

  it("sizes multiline stick-figure actor labels and their box bounds", async () => {
    const graph = await parseMermaid(`sequenceDiagram
box Team<br>North
actor A as One<br>Two<br>Three<br>Four
end
participant Z
A->>Z: hello`);
    expect(graph.type).toBe("sequence");

    const result = graphToExcalidraw(graph);
    const topLabels = result.elements.filter(
      (element: any) =>
        element.type === "text" &&
        element.id?.startsWith("A-top-") &&
        element.text === "One\nTwo\nThree\nFour"
    ) as any[];
    const bottomLabel = result.elements.find(
      (element: any) =>
        element.type === "text" &&
        element.id?.startsWith("A-bottom-") &&
        element.text === "One\nTwo\nThree\nFour"
    ) as any;
    const groupLabel = result.elements.find(
      (element: any) =>
        element.type === "text" && element.text === "Team\nNorth"
    ) as any;
    const groupRect = result.elements.find(
      (element: any) =>
        element.type === "rectangle" &&
        !element.label?.text &&
        element.x <= groupLabel.x &&
        element.x + element.width >= groupLabel.x + groupLabel.width
    ) as any;

    expect(topLabels).toHaveLength(1);
    expect(topLabels[0].height).toBeGreaterThanOrEqual(100);
    expect(bottomLabel.y + bottomLabel.height).toBeLessThanOrEqual(
      groupRect.y + groupRect.height
    );
    expect(groupLabel.y).toBeGreaterThanOrEqual(groupRect.y);
  });

  it("keeps bare multiline sequence participants connected", async () => {
    const graph = await parseMermaid(`sequenceDiagram
participant A\\nB
actor C\\nD as Custom<br>Actor
A\\nB->>C\\nD: Hello<br>there
Note over A\\nB,C\\nD: Together`);
    expect(graph.type).toBe("sequence");

    const result = graphToExcalidraw(graph);
    const labels = result.elements
      .map((element: any) => element.label?.text ?? element.text)
      .filter(Boolean);
    const arrows = result.elements.filter(
      (element: any) => element.type === "arrow"
    );

    expect(labels).toEqual(
      expect.arrayContaining(["A\nB", "Custom\nActor", "Hello\nthere"])
    );
    expect(
      arrows.some((arrow: any) => arrow.label?.text === "Hello\nthere")
    ).toBe(true);
  });

  it("keeps bare multiline sequence actors in boxes and create flows", async () => {
    const graph = await parseMermaid(`sequenceDiagram
box Team
participant A\\nB
end
create participant C\\nD
A\\nB->>C\\nD: create
destroy C\\nD
C\\nD--xA\\nB: done`);
    expect(graph.type).toBe("sequence");

    const result = graphToExcalidraw(graph);
    const labels = result.elements
      .map((element: any) => element.label?.text ?? element.text)
      .filter(Boolean);

    expect(labels).toEqual(expect.arrayContaining(["A\nB", "C\nD"]));
    expect(graph.groups).toHaveLength(1);
    expect(graph.groups[0].actorKeys).toHaveLength(1);
    expect(graph.groups[0].actorKeys[0]).toBe("A\\nB");
    expect(graph.arrows).toHaveLength(2);
  });

  it("preserves activation modifiers on bare multiline sequence ids", async () => {
    const graph = await parseMermaid(`sequenceDiagram
participant A\\nB
participant C\\nD
A\\nB->>+C\\nD: hi<br>there
C\\nD-->>-A\\nB: bye`);
    expect(graph.type).toBe("sequence");

    const activations = graph.nodes
      .flat()
      .filter((node) => node.subtype === "activation");
    expect(activations).toHaveLength(1);
    expect(graph.arrows.map((arrow) => arrow.label?.text)).toEqual([
      "hi\nthere",
      "bye",
    ]);
  });

  it("uses font size 18 for ERD entity table text without changing relationship labels", async () => {
    const definition = `erDiagram
  PERSON ||--o{ CAR : owns
  PERSON {
    string driversLicense PK "The license #"
    string firstName
  }
  CAR {
    string registrationNumber PK
  }`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);
    const personRectangle = result.elements.find(
      (element: any) =>
        element.type === "rectangle" &&
        String(element.id).startsWith("entity-PERSON-")
    );

    expect(personRectangle).toMatchObject({
      label: {
        text: "PERSON",
        fontSize: 18,
      },
    });

    const entityTextNodes = result.elements.filter(
      (element: any) => element.type === "text"
    );
    expect(entityTextNodes.length).toBeGreaterThan(0);
    entityTextNodes.forEach((element: any) => {
      expect(element.fontSize).toBe(18);
    });

    const relationshipArrow = result.elements.find(
      (element: any) =>
        element.type === "arrow" && element.label?.text === "owns"
    );
    expect(relationshipArrow).toMatchObject({
      label: {
        text: "owns",
        fontSize: 16,
      },
    });
  });

  it("does not group single-entity ERD containers with only a bound label", async () => {
    const definition = `erDiagram
  PERSON`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);
    const entityRectangle = result.elements.find(
      (element: any) =>
        element.type === "rectangle" &&
        String(element.id).startsWith("entity-PERSON-")
    );

    expect(entityRectangle).toMatchObject({
      label: {
        text: "PERSON",
      },
    });
    expect(entityRectangle?.groupIds).toBeUndefined();
    expect(entityRectangle?.label?.groupIds).toBeUndefined();

    const textNodes = result.elements.filter(
      (element: any) => element.type === "text"
    );
    expect(textNodes).toHaveLength(0);
  });

  it("leaves ERD entity fill and stroke unset when Mermaid has no explicit styling", async () => {
    const definition = `erDiagram
  PERSON ||--o{ CAR : owns
  PERSON {
    string firstName
  }
  CAR {
    string registrationNumber
  }`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const entityContainers = graph.nodes
      .flat()
      .filter(
        (node: any) =>
          node.type === "rectangle" && String(node.id).startsWith("entity-")
      );

    expect(entityContainers.length).toBeGreaterThanOrEqual(2);
    entityContainers.forEach((container: any) => {
      expect(container.bgColor).toBeUndefined();
      expect(container.strokeColor).toBeUndefined();
      expect(container.strokeWidth).toBeUndefined();
      expect(container.strokeStyle).toBeUndefined();
    });

    expect(graph.lines.length).toBeGreaterThan(0);
    graph.lines.forEach((line) => {
      expect(line.strokeColor).toBeUndefined();
      expect(line.strokeWidth).toBeUndefined();
      expect(line.strokeStyle).toBeUndefined();
    });
  });

  it("preserves explicit ERD entity styles from class definitions", async () => {
    const definition = `erDiagram
  PERSON {
    string firstName
  }
  CAR {
    string registrationNumber
  }
  PERSON:::foo ||--|| CAR : owns
  classDef default fill:#f9f,stroke-width:4px
  classDef foo stroke:#f00,stroke-dasharray: 5 5`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const entityContainers = graph.nodes
      .flat()
      .filter(
        (node: any) =>
          node.type === "rectangle" && String(node.id).startsWith("entity-")
      );
    const personContainer = entityContainers.find((node: any) =>
      String(node.id).startsWith("entity-PERSON-")
    );

    expect(personContainer).toMatchObject({
      bgColor: "#f9f",
      strokeColor: "#f00",
      strokeWidth: 4,
      strokeStyle: "dashed",
    });

    const personLines = graph.lines.filter(
      (line) => line.metadata?.entityId === personContainer?.id
    );

    expect(personLines.length).toBeGreaterThan(0);
    personLines.forEach((line) => {
      expect(line).toMatchObject({
        strokeColor: "#f00",
        strokeWidth: 4,
        strokeStyle: "dashed",
      });
    });
  });

  it("preserves styled ERD header and attribute text colors", async () => {
    const definition = `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : included-in
    CATEGORY ||--o{ PRODUCT : categorizes

    CUSTOMER {
        int customer_id PK
        string first_name
        string last_name
        string email
        string phone
    }
    ORDER {
        int order_id PK
        int customer_id FK
        datetime order_date
        string status
        decimal total_amount
    }
    LINE-ITEM {
        int line_item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    PRODUCT {
        int product_id PK
        string name
        string sku
        decimal price
        int stock_quantity
    }
    CATEGORY {
        int category_id PK
        string name
        string description
    }

    style CUSTOMER fill:#2d3436,stroke:#00cec9,stroke-width:2px,color:#00cec9
    style ORDER fill:#2d3436,stroke:#0984e3,stroke-width:2px,color:#0984e3
    style LINE-ITEM fill:#2d3436,stroke:#6c5ce7,stroke-width:2px,color:#6c5ce7
    style PRODUCT fill:#2d3436,stroke:#e17055,stroke-width:2px,color:#e17055
    style CATEGORY fill:#2d3436,stroke:#fdcb6e,stroke-width:2px,color:#fdcb6e`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "rectangle" && element.label?.text === "CUSTOMER"
      )
    ).toMatchObject({
      backgroundColor: "#2d3436",
      strokeColor: "#00cec9",
      label: {
        strokeColor: "#00cec9",
      },
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" && element.text === "customer_id"
      )
    ).toMatchObject({
      strokeColor: "#00cec9",
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" && element.text === "order_date"
      )
    ).toMatchObject({
      strokeColor: "#0984e3",
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" && element.text === "unit_price"
      )
    ).toMatchObject({
      strokeColor: "#6c5ce7",
    });

    expect(
      result.elements.find(
        (element: any) =>
          element.type === "text" && element.text === "description"
      )
    ).toMatchObject({
      strokeColor: "#fdcb6e",
    });
  });

  it("maps ERD cardinalities to supported arrowheads and centers relationship labels", async () => {
    const definition = `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains
  CUSTOMER }o..o{ DELIVERY-ADDRESS : uses`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);
    const arrows = result.elements.filter(
      (element: any) => element.type === "arrow"
    );

    expect(arrows).toHaveLength(3);
    expect(
      arrows.map((arrow: any) => ({
        label: arrow.label?.text,
        textAlign: arrow.label?.textAlign,
        startArrowhead: arrow.startArrowhead,
        endArrowhead: arrow.endArrowhead,
        strokeStyle: arrow.strokeStyle,
      }))
    ).toEqual([
      {
        label: "places",
        textAlign: "center",
        startArrowhead: "cardinality_exactly_one",
        endArrowhead: "cardinality_zero_or_many",
        strokeStyle: "solid",
      },
      {
        label: "contains",
        textAlign: "center",
        startArrowhead: "cardinality_exactly_one",
        endArrowhead: "cardinality_one_or_many",
        strokeStyle: "solid",
      },
      {
        label: "uses",
        textAlign: "center",
        startArrowhead: "cardinality_zero_or_many",
        endArrowhead: "cardinality_zero_or_many",
        strokeStyle: "dashed",
      },
    ]);
  });

  it("parses ERD self relationships by merging Mermaid's cyclic edge segments", async () => {
    const definition = `erDiagram
  CATEGORY ||--o{ CATEGORY : parent_of
  CATEGORY {
    integer id PK
    integer parent_id FK
    string display_name
  }`;

    const graph = await parseMermaid(definition);
    expect(graph.type).toBe("erd");

    const result = graphToExcalidraw(graph);
    const arrows = result.elements.filter(
      (element: any) => element.type === "arrow"
    );

    expect(arrows).toHaveLength(1);
    expect(arrows[0]).toMatchObject({
      startArrowhead: "cardinality_exactly_one",
      endArrowhead: "cardinality_zero_or_many",
      label: {
        text: "parent_of",
        textAlign: "center",
      },
    });
    expect(arrows[0].points.length).toBeGreaterThan(2);
    expect(hasConsecutiveDuplicatePoints(arrows[0].points)).toBe(false);
  });

  it("parses every playground example without malformed output colors", async () => {
    for (const testcase of PLAYGROUND_TESTCASES) {
      const graph = await parseMermaid(testcase.definition);
      const expectedType =
        testcase.type === "unsupported" ? "graphImage" : testcase.type;

      expect(graph.type).toBe(expectedType);

      const result = graphToExcalidraw(graph);
      expect(result.elements.length).toBeGreaterThan(0);

      for (const entry of collectColorEntries(result.elements)) {
        if (!isValidCSSColor(entry.value)) {
          throw new Error(
            `${testcase.type}:${testcase.name} produced invalid color ${entry.value} at ${entry.path}`
          );
        }
      }
    }
  }, 20000);
});
