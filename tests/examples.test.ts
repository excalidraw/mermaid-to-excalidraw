import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parseMermaid } from "../src/parseMermaid.js";
import { DEFAULT_FONT_SIZE } from "../src/constants.js";
import { isValidCSSColor } from "../src/parser/cssUtils.js";
import { CLASS_DIAGRAM_TESTCASES } from "../playground/testcases/class.ts";
import { ERD_DIAGRAM_TESTCASES } from "../playground/testcases/er.ts";
import { FLOWCHART_DIAGRAM_TESTCASES } from "../playground/testcases/flowchart.ts";
import { SEQUENCE_DIAGRAM_TESTCASES } from "../playground/testcases/sequence.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "../playground/testcases/unsupported.ts";

const PLAYGROUND_TESTCASES = [
  ...FLOWCHART_DIAGRAM_TESTCASES,
  ...SEQUENCE_DIAGRAM_TESTCASES,
  ...CLASS_DIAGRAM_TESTCASES,
  ...ERD_DIAGRAM_TESTCASES,
  ...UNSUPPORTED_DIAGRAM_TESTCASES,
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
    if (typeof element.strokeColor === "string" && element.strokeColor) {
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
          node.type === "rectangle" &&
          String(node.id).startsWith("entity-")
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
          node.type === "rectangle" &&
          String(node.id).startsWith("entity-")
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
