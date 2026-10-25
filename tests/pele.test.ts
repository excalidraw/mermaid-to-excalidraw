import { NODE_BACKGROUND_COLOR } from "../src/constants.js";
import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parsePele } from "../src/pele/parsePele.js";
import {
  evenOutRoute,
  getRoutePosition,
  lengthenRouteEnds,
  parsePath,
  parseSvg,
  simplifyRoute,
} from "../src/pele/svg.js";
import { parsePeleFlowchart } from "../src/pele/flowchart.js";
import { parse, render, type FlowchartModel } from "pele";
import type { Flowchart } from "../src/parser/flowchart.js";
import { FLOWCHART_DIAGRAM_TESTCASES } from "../playground/testcases/flowchart.ts";
import { LINE_BREAK_TESTCASES } from "../playground/testcases/lineBreaks.ts";
import { SEQUENCE_DIAGRAM_TESTCASES } from "../playground/testcases/sequence.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "../playground/testcases/unsupported.ts";
import type { Sequence } from "../src/parser/sequence.js";
import type { Class } from "../src/parser/class.js";
import { CLASS_DIAGRAM_TESTCASES } from "../playground/testcases/class.ts";
import { ERD_DIAGRAM_TESTCASES } from "../playground/testcases/er.ts";
import { STATE_DIAGRAM_TESTCASES } from "../playground/testcases/state.ts";
import type { ERD } from "../src/parser/er.js";
import type { State } from "../src/parser/state.js";

const parseFlowchart = async (definition: string) => {
  const graph = await parsePele(definition);
  expect(graph.type).toBe("flowchart");
  return graph as Flowchart;
};

const isFiniteBox = (box: {
  x: number;
  y: number;
  width: number;
  height: number;
}) =>
  [box.x, box.y, box.width, box.height].every(Number.isFinite) &&
  box.width > 0 &&
  box.height > 0;

describe("parsePath", () => {
  it("reads absolute and relative commands as absolute points", () => {
    expect(
      parsePath("M10,10L20,10H30V40l5,5h-5v5C1,2 3,4 5,6Q7,8 9,10Z").map(
        ({ command, points }) => [command, points]
      )
    ).toEqual([
      ["M", [{ x: 10, y: 10 }]],
      ["L", [{ x: 20, y: 10 }]],
      ["H", [{ x: 30, y: 10 }]],
      ["V", [{ x: 30, y: 40 }]],
      ["L", [{ x: 35, y: 45 }]],
      ["H", [{ x: 30, y: 45 }]],
      ["V", [{ x: 30, y: 50 }]],
      [
        "C",
        [
          { x: 1, y: 2 },
          { x: 3, y: 4 },
          { x: 5, y: 6 },
        ],
      ],
      [
        "Q",
        [
          { x: 7, y: 8 },
          { x: 9, y: 10 },
        ],
      ],
      ["Z", [{ x: 10, y: 10 }]],
    ]);
  });

  it("skips arc parameters and treats coordinates after a moveto as linetos", () => {
    expect(
      parsePath("M-29.11,-24A29.11,6 0 0 1 29.11,-24V24").map(
        ({ points }) => points[points.length - 1]
      )
    ).toEqual([
      { x: -29.11, y: -24 },
      { x: 29.11, y: -24 },
      { x: 29.11, y: 24 },
    ]);
    expect(parsePath("M0,0 10,0 10,10").map(({ command }) => command)).toEqual([
      "M",
      "L",
      "L",
    ]);
  });
});

describe("simplifyRoute", () => {
  it("drops duplicate and collinear points", () => {
    expect(
      simplifyRoute([
        { x: 0, y: 0 },
        { x: 0, y: 0.2 },
        { x: 0, y: 10 },
        { x: 0, y: 20 },
        { x: 10, y: 20 },
      ])
    ).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 20 },
      { x: 10, y: 20 },
    ]);
  });
});

describe("evenOutRoute", () => {
  const getLengths = (route: { x: number; y: number }[]) =>
    route
      .slice(1)
      .map((point, index) =>
        Math.hypot(point.x - route[index].x, point.y - route[index].y)
      );

  it("splits long segments next to short ones, keeping the route", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 1000, y: 0 },
      { x: 1000, y: 40 },
      { x: 1100, y: 40 },
    ];
    const evened = evenOutRoute(route);
    const lengths = getLengths(evened);

    expect(evened.length).toBeGreaterThan(route.length);
    route.forEach((point) => expect(evened).toContainEqual(point));
    // the added points are on the route's segments
    evened.forEach(({ x, y }) =>
      expect(y === 0 || x === 1000 || y === 40).toBe(true)
    );
    lengths.slice(1).forEach((length, index) => {
      const ratio =
        Math.max(length, lengths[index]) / Math.min(length, lengths[index]);
      expect(ratio).toBeLessThanOrEqual(3);
    });
  });

  it("leaves even routes alone", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(evenOutRoute(route)).toEqual(route);
  });
});

describe("lengthenRouteEnds", () => {
  it("moves the bends before short end stubs back, towards the runs before them", () => {
    // as Pele routes a transition between two states (stubs of 12 and 13)
    const route = [
      { x: 354, y: 624 },
      { x: 354, y: 636 },
      { x: 321, y: 648 },
      { x: 232, y: 652 },
      { x: 142, y: 663 },
      { x: 109, y: 692 },
      { x: 109, y: 804 },
      { x: 165, y: 818 },
      { x: 190, y: 824 },
      { x: 190, y: 837 },
    ];
    const lengthened = lengthenRouteEnds(route, 30);

    expect(lengthened[0]).toEqual(route[0]);
    expect(lengthened.at(-1)).toEqual(route.at(-1));
    // straight for (at least about) 30 at both ends
    expect(lengthened[1].x).toBe(354);
    expect(lengthened[1].y - lengthened[0].y).toBe(30);
    expect(lengthened.at(-2)!.x).toBe(190);
    expect(lengthened.at(-1)!.y - lengthened.at(-2)!.y).toBe(29);
    // the runs the route comes from stay where they are
    expect(lengthened.slice(5, 7)).toEqual(route.slice(5, 7));
  });

  it("moves the bend after a diagonal back along the stub", () => {
    // as Pele routes a transition out of a fork: diagonal, then a stub
    const route = [
      { x: 491, y: 423 },
      { x: 372, y: 476 },
      { x: 372, y: 489 },
    ];
    expect(lengthenRouteEnds(route, 30)).toEqual([
      { x: 491, y: 423 },
      { x: 372, y: 459 },
      { x: 372, y: 489 },
    ]);
  });

  it("leaves long enough stubs alone", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 0, y: 40 },
      { x: 100, y: 60 },
      { x: 100, y: 100 },
    ];
    expect(lengthenRouteEnds(route, 30)).toEqual(route);
  });
});

describe("getRoutePosition", () => {
  it("is how far along the route the closest point is, by length", () => {
    const route = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(getRoutePosition(route, { x: 50, y: 10 })).toBe(0.25);
    expect(getRoutePosition(route, { x: 110, y: 50 })).toBe(0.75);
    expect(getRoutePosition(route, { x: -10, y: 0 })).toBe(0);
  });
});

describe("parsePele", () => {
  beforeAll(() => {
    // jsdom has no canvas (and logs that it doesn't): Pele falls back to its
    // built-in text metrics either way.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("flowchart playground examples", () => {
    const testcases = [
      ...FLOWCHART_DIAGRAM_TESTCASES,
      ...LINE_BREAK_TESTCASES.filter(({ type }) => type === "flowchart"),
    ];

    it.each(testcases.map((testcase) => [testcase.name, testcase]))(
      "%s",
      async (_, { definition }) => {
        const flowchart = await parseFlowchart(definition);
        const vertices = Object.values(flowchart.vertices).flatMap((vertex) =>
          vertex ? [vertex] : []
        );
        const ids = new Set([
          ...vertices.map((vertex) => vertex.id),
          ...flowchart.subGraphs.map((subGraph) => subGraph.id),
        ]);

        expect(vertices.length).toBeGreaterThan(0);
        vertices.forEach((vertex) => expect(isFiniteBox(vertex)).toBe(true));
        flowchart.subGraphs.forEach((subGraph) =>
          expect(isFiniteBox(subGraph)).toBe(true)
        );
        flowchart.edges.forEach((edge) => {
          expect(ids.has(edge.start)).toBe(true);
          expect(ids.has(edge.end)).toBe(true);
          expect(edge.reflectionPoints.length).toBeGreaterThanOrEqual(2);
          edge.reflectionPoints.forEach((point) => {
            expect(Number.isFinite(point.x)).toBe(true);
            expect(Number.isFinite(point.y)).toBe(true);
          });
        });

        expect(graphToExcalidraw(flowchart).elements.length).toBeGreaterThan(0);
      }
    );
  });

  it("reads node, label and subgraph styles Pele resolved from style, classDef and class", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  classDef default fill:#eee
  classDef hot fill:#f96,stroke:#333,stroke-width:4px,color:#fff,stroke-dasharray: 5 5
  A:::hot --> B
  style B fill:#bbf,color:#123456
  subgraph S [Group]
    C
  end
  style S fill:#ffe,stroke:#aa0`);

    expect(flowchart.vertices.A?.containerStyle).toEqual({
      fill: "#f96",
      stroke: "#333",
      "stroke-width": "4px",
      "stroke-dasharray": "5 5",
    });
    expect(flowchart.vertices.A?.labelStyle).toEqual({ color: "#fff" });
    expect(flowchart.vertices.B?.containerStyle).toEqual({ fill: "#bbf" });
    expect(flowchart.vertices.B?.labelStyle).toEqual({ color: "#123456" });
    expect(flowchart.vertices.C?.containerStyle).toEqual({ fill: "#eee" });
    expect(flowchart.subGraphs[0].containerStyle).toEqual({
      fill: "#ffe",
      stroke: "#aa0",
    });
    // `style S` doesn't make the subgraph a node
    expect(flowchart.vertices.S).toBeUndefined();
  });

  it("keeps the nesting of subgraphs", async () => {
    const flowchart = await parseFlowchart(`flowchart TB
  subgraph outer [Outer]
    subgraph inner [Inner]
      A --> B
    end
    C
  end`);

    const inner = flowchart.subGraphs.find(({ id }) => id === "inner");
    const outer = flowchart.subGraphs.find(({ id }) => id === "outer");
    expect(inner?.nodeIds.sort()).toEqual(["A", "B"]);
    expect(outer?.nodeIds.sort()).toEqual(["C", "inner"]);
    expect(outer!.x).toBeLessThan(inner!.x);
    expect(outer!.y).toBeLessThan(inner!.y);
    expect(outer!.x + outer!.width).toBeGreaterThan(inner!.x + inner!.width);
  });

  it("extends edges through their arrowheads to the node outline", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  A --> B
  C <--> D`);

    const [ab, cd] = flowchart.edges;
    const { A, B, C, D } = flowchart.vertices;

    expect(ab.startX).toBeCloseTo(A!.x + A!.width, 1);
    expect(ab.endX).toBeCloseTo(B!.x, 1);
    expect(cd.startX).toBeCloseTo(C!.x + C!.width, 1);
    expect(cd.endX).toBeCloseTo(D!.x, 1);
  });

  it("attaches edges to diamonds on the line from their center, not next to their vertices", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  B --> C{Decision}
  C -->|One| D[Result one]
  C -->|Two| E[Result two]`);

    const C = flowchart.vertices.C!;
    const center = { x: C.x + C.width / 2, y: C.y + C.height / 2 };
    flowchart.edges
      .filter((edge) => edge.start === "C")
      .forEach(({ reflectionPoints: [start, next] }) => {
        // on the outline
        expect(
          Math.abs(start.x - center.x) / (C.width / 2) +
            Math.abs(start.y - center.y) / (C.height / 2)
        ).toBeCloseTo(1, 2);
        // on the line from the center to the next point
        expect(
          (start.x - center.x) * (next.y - center.y) -
            (start.y - center.y) * (next.x - center.x)
        ).toBeCloseTo(0, 0);
        // away from the right vertex
        expect(C.x + C.width - start.x).toBeGreaterThan(C.width / 8);
      });
  });

  it("enlarges diamonds around their center until Excalidraw fits their label", () => {
    const model = parse("flowchart LR\n  A --> C{Decision}") as FlowchartModel;
    const root = parseSvg(
      render(model, { responsive: false, autoDirection: false, fontSize: 20 })
        .svg
    );
    const original = parsePeleFlowchart(model, root, { fontSize: 20 });
    const fitted = parsePeleFlowchart(model, root, {
      fontSize: 20,
      // "Decision": 80px
      measureText: (text) => text.length * 10,
    });

    const before = original.vertices.C!;
    const after = fitted.vertices.C!;
    // Excalidraw fits the label in half the diamond's width, minus padding
    expect(after.width / 2 - 10).toBeGreaterThanOrEqual(80);
    expect(after.height).toBeGreaterThanOrEqual(before.height);
    expect(after.x + after.width / 2).toBeCloseTo(before.x + before.width / 2);
    expect(after.y + after.height / 2).toBeCloseTo(
      before.y + before.height / 2
    );

    // The edge ends on the enlarged diamond
    const { endX, endY } = fitted.edges[0];
    expect(
      Math.abs(endX - (after.x + after.width / 2)) / (after.width / 2) +
        Math.abs(endY - (after.y + after.height / 2)) / (after.height / 2)
    ).toBeCloseTo(1, 2);
  });

  it("fits diamonds to the lines Pele wrapped their label in", () => {
    const model = parse(
      "flowchart LR\n  C{This is the text in the box}"
    ) as FlowchartModel;
    const root = parseSvg(
      render(model, { responsive: false, autoDirection: false, fontSize: 20 })
        .svg
    );
    const lines = Array.from(
      root.querySelectorAll(".pele-label tspan[y]"),
      (tspan) => tspan.textContent || ""
    );
    expect(lines.length).toBeGreaterThan(1);

    const measureText = (text: string) => text.length * 10;
    const { C } = parsePeleFlowchart(model, root, {
      fontSize: 20,
      measureText,
    }).vertices;
    const longestLine = Math.max(...lines.map(measureText));
    expect(C!.width / 2 - 10).toBeGreaterThanOrEqual(longestLine);
    // not the whole label on a single line
    expect(C!.width / 2 - 10).toBeLessThan(
      measureText("This is the text in the box")
    );
    expect(C!.height / 2 - 10).toBeGreaterThanOrEqual(lines.length * 20 * 1.25);
  });

  it("skips links between a subgraph and its content, which Mermaid doesn't draw", async () => {
    const flowchart = await parseFlowchart(`flowchart TB
  subgraph conference
    subgraph track
      frontend
    end
    backend
  end
  frontend --> conference
  conference --> backend
  backend --> track
  frontend --> backend`);

    expect(flowchart.edges.map(({ start, end }) => `${start}-${end}`)).toEqual([
      "backend-track",
      "frontend-backend",
    ]);
  });

  it("maps edge types and strokes", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  A --> B
  B ==> C
  C -.-> D
  D --o E
  E --x F
  F --- G
  G ~~~ H`);

    expect(flowchart.edges.map(({ type, stroke }) => [type, stroke])).toEqual([
      ["arrow_point", "normal"],
      ["arrow_point", "thick"],
      ["arrow_point", "dotted"],
      ["arrow_circle", "normal"],
      ["arrow_cross", "normal"],
      ["arrow_open", "normal"],
      // invisible link isn't drawn
    ]);
  });

  it("puts edge labels where Pele drew them, wrapped as Pele wrapped them", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  subgraph Water
    direction LR
    PS[Primary Settling] --> BT[Biological Treatment] --> SEC[Secondary Clarification]
  end
  subgraph Sludge
    TK[Sludge Thickening]
  end
  PS -->|Primary Sludge| TK
  SEC -->|Waste Activated Sludge - WAS| TK`);

    const edge = flowchart.edges.find(
      ({ start, end }) => start === "SEC" && end === "TK"
    );
    // where Pele wraps depends on its text metrics
    expect(edge?.text).toContain("\n");
    expect(edge?.text.replace(/\n/g, " ")).toBe("Waste Activated Sludge - WAS");
    // Pele puts the label between the subgraphs
    const route = edge!.reflectionPoints;
    const lengths = route
      .slice(1)
      .map((point, index) =>
        Math.hypot(point.x - route[index].x, point.y - route[index].y)
      );
    let remaining =
      edge!.labelPosition! * lengths.reduce((sum, length) => sum + length, 0);
    const index = lengths.findIndex((length) => (remaining -= length) <= 0);
    const t = 1 + remaining / lengths[index];
    const labelX = route[index].x + (route[index + 1].x - route[index].x) * t;
    const [water, sludge] = flowchart.subGraphs;
    expect(labelX).toBeGreaterThan(water.x + water.width);
    expect(labelX).toBeLessThan(sludge.x);
  });

  it("keeps links Pele allows and drops the others", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  A --> B
  click A "https://example.com"
  click B "javascript:alert(1)"`);

    expect(flowchart.vertices.A?.link).toBe("https://example.com/");
    expect(flowchart.vertices.B?.link).toBeUndefined();
  });

  it("decodes line breaks, entities and markdown labels", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  A["one<br>two"] --> B["say #quot;hi#quot;"]
  B --> C["\`**bold** text\`"]`);

    expect(flowchart.vertices.A?.text).toBe("one\ntwo");
    expect(flowchart.vertices.B?.text).toBe('say "hi"');
    expect(flowchart.vertices.C?.labelType).toBe("markdown");
  });

  it("parses <br> in bare ids by retrying with \\n", async () => {
    const flowchart = await parseFlowchart(`flowchart LR
  Web<br>app --> API`);

    expect(Object.keys(flowchart.vertices)).toContain("Web\\napp");
    expect(flowchart.vertices["Web\\napp"]?.text).toBe("Web\napp");
  });

  it("returns other diagram types as an SVG image", async () => {
    const graph = await parsePele(UNSUPPORTED_DIAGRAM_TESTCASES[0].definition);

    expect(graph).toMatchObject({
      type: "graphImage",
      mimeType: "image/svg+xml",
    });
    if (graph.type === "graphImage") {
      expect(graph.dataURL.startsWith("data:image/svg+xml;base64,")).toBe(true);
      expect(graph.width).toBeGreaterThan(0);
      expect(graph.height).toBeGreaterThan(0);
    }
  });

  it("throws on syntax errors", async () => {
    await expect(parsePele("flowchart LR\n  A[Start] -->")).rejects.toThrow(
      /Parse error on line/
    );
  });
});

describe("parsePele sequence diagrams", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const parseSequence = async (definition: string) => {
    const graph = await parsePele(definition);
    expect(graph.type).toBe("sequence");
    return graph as Sequence;
  };

  const getContainers = (sequence: Sequence) =>
    sequence.nodes.flat().filter((node) => node.type === "rectangle");

  it("fills notes, hiding the lifelines they're drawn over", async () => {
    const sequence = await parseSequence(`sequenceDiagram
  participant A
  participant B
  Note over A,B: Across both`);

    const note = getContainers(sequence).find(
      (container) => container.subtype === "note"
    );
    expect(note?.bgColor).toBe("#ffffff");
  });

  it("puts a message to self's label next to its loop, where Pele drew it", async () => {
    const sequence = await parseSequence(`sequenceDiagram
  autonumber
  participant A
  A->>A: Lock door and verify sensor closure`);

    const [arrow] = sequence.arrows;
    expect(arrow.label).toBeUndefined();
    const label = sequence.nodes
      .flat()
      .find(
        (node) =>
          node.type === "text" &&
          node.text === "Lock door and verify sensor closure"
      );
    expect(label).toMatchObject({ type: "text", fontSize: 16 });
    // right of the loop, which starts on the lifeline
    expect(label!.x).toBeGreaterThan(arrow.startX);
    expect(arrow.sequenceNumber?.label?.text).toBe("1");
  });

  it.each(
    [
      ...SEQUENCE_DIAGRAM_TESTCASES,
      ...LINE_BREAK_TESTCASES.filter(({ type }) => type === "sequence"),
    ].map((testcase) => [testcase.name, testcase])
  )("%s", async (_, { definition }) => {
    const sequence = await parseSequence(definition);

    expect(sequence.lines.length).toBeGreaterThan(0);
    [...sequence.nodes.flat(), ...sequence.arrows].forEach((node) => {
      const coordinates =
        node.type === "line" || node.type === "arrow"
          ? [node.startX, node.startY, node.endX, node.endY]
          : [node.x, node.y];
      coordinates.forEach((value) => expect(Number.isFinite(value)).toBe(true));
    });
    expect(graphToExcalidraw(sequence).elements.length).toBeGreaterThan(0);
  });

  it("draws participants at both ends of their lifeline and binds messages to them", async () => {
    const sequence = await parseSequence(`sequenceDiagram
  participant A as Alice
  actor B as Bob
  A->>B: Hello`);

    const ids = sequence.nodes.flat().map((node) => node.id);
    expect(ids).toContain("A-top");
    expect(ids).toContain("A-bottom");
    expect(ids.some((id) => id?.startsWith("B-top-"))).toBe(true);
    expect(
      getContainers(sequence).find(({ id }) => id === "A-top")
    ).toMatchObject({
      label: { text: "Alice" },
      subtype: "actor",
    });

    const [arrow] = sequence.arrows;
    // not bound to the actors, far up the lifelines (Excalidraw would move
    // the arrow's ends onto them)
    expect(arrow.start).toBeUndefined();
    expect(arrow.end).toBeUndefined();
    expect(arrow.label?.text).toBe("Hello");
  });

  it("maps message arrowheads and line styles", async () => {
    const sequence = await parseSequence(`sequenceDiagram
  A->B: open
  A->>B: arrow
  A-->>B: dotted
  A<<->>B: both`);

    expect(
      sequence.arrows.map(({ startArrowhead, endArrowhead, strokeStyle }) => [
        startArrowhead,
        endArrowhead,
        strokeStyle,
      ])
    ).toEqual([
      [null, null, "solid"],
      [null, "arrow", "solid"],
      [null, "arrow", "dotted"],
      ["arrow", "arrow", "solid"],
    ]);
  });

  it("reads notes, activations, highlights, boxes and sequence numbers", async () => {
    const sequence = await parseSequence(`sequenceDiagram
  autonumber
  box rgb(191, 223, 255) Team
    participant A
  end
  participant B
  rect rgb(200, 150, 255)
    A->>+B: Hi
    Note right of B: a note
    B-->>-A: Bye
  end`);

    const containers = getContainers(sequence);
    expect(containers.find(({ subtype }) => subtype === "note")).toMatchObject({
      label: { text: "a note" },
      strokeStyle: "dashed",
    });
    expect(
      containers.filter(({ subtype }) => subtype === "activation")
    ).toHaveLength(1);
    expect(
      containers.find(({ subtype }) => subtype === "highlight")
    ).toMatchObject({
      bgColor: "rgb(200, 150, 255)",
      strokeColor: "transparent",
    });
    expect(sequence.groups).toEqual([
      expect.objectContaining({
        name: "Team",
        actorKeys: ["A"],
        fill: "rgb(191, 223, 255)",
        bounds: expect.objectContaining({ width: expect.any(Number) }),
      }),
    ]);
    expect(
      sequence.arrows.map(({ sequenceNumber }) => sequenceNumber?.label?.text)
    ).toEqual(["1", "2"]);
  });

  it("reads frames as outlines, kind tabs and section labels", async () => {
    const sequence = await parseSequence(`sequenceDiagram
  alt is sick
    A->>B: Not so good
  else is well
    A->>B: Fine
  end`);

    expect(sequence.loops?.nodes.map(({ label }) => label?.text)).toEqual([
      "alt",
    ]);
    expect(sequence.loops?.texts.map(({ text }) => text)).toEqual([
      "[is well]",
      "[is sick]",
    ]);
    // outline + separator
    expect(sequence.loops?.lines.length).toBe(5);
  });

  it("draws destroyed actors without their footer", async () => {
    const sequence = await parseSequence(`sequenceDiagram
  A->>B: Hi
  destroy B
  A-xB: Bye`);

    const ids = sequence.nodes.flat().map((node) => node.id);
    expect(ids).toContain("A-bottom");
    expect(ids).not.toContain("B-bottom");
  });
});

describe("parsePele class diagrams", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const parseClassDiagram = async (definition: string) => {
    const graph = await parsePele(definition);
    expect(graph.type).toBe("class");
    return graph as Class;
  };

  it.each(
    [
      ...CLASS_DIAGRAM_TESTCASES,
      ...LINE_BREAK_TESTCASES.filter(({ type }) => type === "class"),
    ].map((testcase) => [testcase.name, testcase])
  )("%s", async (_, { definition }) => {
    const diagram = await parseClassDiagram(definition);
    const [classes] = diagram.nodes;

    expect(classes.length).toBeGreaterThan(0);
    [...diagram.nodes.flat(), ...diagram.text].forEach((node) => {
      if ("x" in node) {
        expect(Number.isFinite(node.x)).toBe(true);
        expect(Number.isFinite(node.y)).toBe(true);
      }
    });
    diagram.arrows.forEach((arrow) => {
      expect(arrow.points!.length).toBeGreaterThanOrEqual(2);
    });
    expect(graphToExcalidraw(diagram).elements.length).toBeGreaterThan(0);
  });

  it("groups a class's box, dividers, members and methods", async () => {
    const diagram = await parseClassDiagram(`classDiagram
  class Animal {
    <<interface>>
    +String name
    +eat() void
  }`);

    const [[animal]] = diagram.nodes;
    expect(animal).toMatchObject({ id: "Animal" });
    // annotations are smaller than the name: both are separate texts
    expect(animal.label).toBeUndefined();
    expect(diagram.text.map(({ text, fontSize }) => [text, fontSize])).toEqual([
      ["«interface»", 16],
      ["Animal", 20],
      ["+String name", 18],
      ["+eat() : void", 18],
    ]);
    expect(diagram.lines.length).toBe(2);
    expect(
      (await parseClassDiagram("classDiagram\n  class Plain")).nodes[0][0].label
    ).toMatchObject({ text: "Plain", verticalAlign: "top" });
    [...diagram.lines, ...diagram.text].forEach((element) => {
      expect(element.groupId).toBe(animal.groupId);
      expect(element.metadata).toEqual({ classId: "Animal" });
    });
  });

  it("maps relation types to arrowheads, from the first class to the second", async () => {
    const diagram = await parseClassDiagram(`classDiagram
  A <|-- B
  C *-- D
  E o-- F
  G <.. H
  I -- J
  K ()-- L`);

    expect(
      diagram.arrows.map(
        ({ start, end, startArrowhead, endArrowhead, strokeStyle }) => [
          start?.id,
          end?.id,
          startArrowhead,
          endArrowhead,
          strokeStyle,
        ]
      )
    ).toEqual([
      ["A", "B", "triangle_outline", null, "solid"],
      ["C", "D", "diamond", null, "solid"],
      ["E", "F", "diamond_outline", null, "solid"],
      ["G", "H", "arrow", null, "dotted"],
      ["I", "J", null, null, "solid"],
      // `K` is an interface: a label above the lollipop, not a class
      [undefined, "L", "circle_outline", null, "solid"],
    ]);
    expect(diagram.text.map(({ text }) => text)).toEqual(["K"]);
    diagram.arrows.slice(0, -1).forEach(({ startX, startY, start }) => {
      const box = diagram.nodes[0].find(({ id }) => id === start?.id)!;
      // starts on the first class's outline
      expect(startX).toBeGreaterThanOrEqual(box.x - 1);
      expect(startX).toBeLessThanOrEqual(box.x + box.width! + 1);
      expect(startY).toBeGreaterThanOrEqual(box.y - 1);
      expect(startY).toBeLessThanOrEqual(box.y + box.height! + 1);
    });
  });

  it("reads cardinalities, notes and namespaces", async () => {
    const diagram = await parseClassDiagram(`classDiagram
  namespace Shapes {
    class Square
  }
  Customer "1" --> "*" Ticket : buys
  note for Customer "a note"`);

    expect(diagram.text.map(({ text }) => text)).toEqual(["1", "*"]);
    expect(diagram.arrows[0].label?.text).toBe("buys");
    expect(diagram.nodes[1]).toEqual([
      expect.objectContaining({
        subtype: "note",
        label: expect.objectContaining({ text: "a note" }),
      }),
    ]);
    expect(diagram.arrows[1]).toMatchObject({
      strokeStyle: "dotted",
      start: { id: diagram.nodes[1][0].id },
      end: { id: "Customer" },
    });
    expect(diagram.namespaces.map(({ id }) => id)).toEqual(["Shapes"]);
    expect(Object.keys(diagram.namespaces[0].classes)).toEqual(["Square"]);
  });

  it("puts a self-relation's label next to its loop", async () => {
    const diagram = await parseClassDiagram(`classDiagram
  Snake -- Snake : eats`);

    expect(diagram.arrows[0].label).toBeUndefined();
    expect(diagram.text.map(({ text }) => text)).toEqual(["eats"]);
  });
});

describe("parsePele ER diagrams", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const parseERD = async (definition: string) => {
    const graph = await parsePele(definition);
    expect(graph.type).toBe("erd");
    return graph as ERD;
  };

  it.each(
    [
      ...ERD_DIAGRAM_TESTCASES,
      ...LINE_BREAK_TESTCASES.filter(({ type }) => type === "erd"),
    ].map((testcase) => [testcase.name, testcase])
  )("%s", async (_, { definition }) => {
    const diagram = await parseERD(definition);

    expect(diagram.nodes[0].length).toBeGreaterThan(0);
    diagram.arrows.forEach((arrow) => {
      expect(arrow.points!.length).toBeGreaterThanOrEqual(2);
    });
    expect(graphToExcalidraw(diagram).elements.length).toBeGreaterThan(0);
  });

  it("reads entities with their attributes, and relationships with their cardinalities", async () => {
    const diagram = await parseERD(`erDiagram
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER {
    string name PK "the name"
  }
  ORDER }|..|| CUSTOMER : "billed to"`);

    const [customer, order] = diagram.nodes[0];
    expect(customer).toMatchObject({
      id: "entity-CUSTOMER-0",
      label: { text: "CUSTOMER", verticalAlign: "top" },
    });
    expect(order.label).toMatchObject({
      text: "ORDER",
      verticalAlign: "middle",
    });
    expect(diagram.text.map(({ text }) => text)).toEqual([
      "string",
      "name",
      "PK",
      "the name",
    ]);
    diagram.text.forEach(({ groupId }) =>
      expect(groupId).toBe(customer.groupId)
    );

    expect(
      diagram.arrows.map(
        ({ start, end, startArrowhead, endArrowhead, strokeStyle, label }) => [
          start?.id,
          end?.id,
          startArrowhead,
          endArrowhead,
          strokeStyle,
          label?.text,
        ]
      )
    ).toEqual([
      [
        "entity-CUSTOMER-0",
        "entity-ORDER-1",
        "cardinality_exactly_one",
        "cardinality_zero_or_many",
        "solid",
        "places",
      ],
      [
        "entity-ORDER-1",
        "entity-CUSTOMER-0",
        "cardinality_one_or_many",
        "cardinality_exactly_one",
        "dashed",
        "billed to",
      ],
    ]);
  });
});

describe("parsePele state diagrams", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const parseState = async (definition: string) => {
    const graph = await parsePele(definition);
    expect(graph.type).toBe("state");
    return graph as State;
  };

  it.each(
    [
      ...STATE_DIAGRAM_TESTCASES,
      ...LINE_BREAK_TESTCASES.filter(({ type }) => type === "state"),
    ].map((testcase) => [testcase.name, testcase])
  )("%s", async (_, { definition }) => {
    const diagram = await parseState(definition);
    const ids = new Set(diagram.nodes.map(({ id }) => id));

    expect(diagram.nodes.length).toBeGreaterThan(0);
    diagram.edges.forEach((edge) => {
      expect(ids.has(edge.start)).toBe(true);
      expect(ids.has(edge.end)).toBe(true);
      expect(edge.reflectionPoints.length).toBeGreaterThanOrEqual(2);
    });
    expect(graphToExcalidraw(diagram).elements.length).toBeGreaterThan(0);
  });

  it("reads states, pseudo-states, composites and notes", async () => {
    const diagram = await parseState(`stateDiagram-v2
  state Choice <<choice>>
  state Fork <<fork>>
  [*] --> Idle
  Idle : waiting
  Idle : for input
  Idle --> Choice
  Choice --> Fork
  state Busy {
    [*] --> Working
  }
  Fork --> Busy
  note right of Busy : a note
  Busy --> [*]`);

    const shapes = Object.fromEntries(
      diagram.nodes.map(({ id, shape }) => [id, shape])
    );
    expect(shapes).toMatchObject({
      root_start: "stateStart",
      root_end: "stateEnd",
      Idle: "rectWithTitle",
      Choice: "choice",
      Fork: "fork",
      Busy: "roundedWithTitle",
      Working: "rect",
    });
    expect(diagram.nodes.find(({ id }) => id === "Idle")).toMatchObject({
      text: "waiting",
      description: ["for input"],
    });
    expect(diagram.nodes.find(({ shape }) => shape === "note")?.text).toBe(
      "a note"
    );
    // composites first, behind their states
    expect(diagram.nodes[0].id).toBe("Busy");
    expect(diagram.nodes[0].dividerLine).toBeDefined();
  });

  it("finds the states a transition connects from where it's drawn", async () => {
    const diagram = await parseState(`stateDiagram-v2
  state Outer {
    [*] --> A
    A --> B : go
  }
  B --> C
  Outer --> D`);

    expect(
      diagram.edges.map(({ start, end, text }) => [start, end, text])
    ).toEqual(
      expect.arrayContaining([
        ["Outer_start", "A", ""],
        ["A", "B", "go"],
        ["B", "C", ""],
        ["Outer", "D", ""],
      ])
    );
  });

  it("draws the separators of concurrent regions", async () => {
    const diagram = await parseState(`stateDiagram-v2
  state Active {
    [*] --> Left
    --
    [*] --> Right
  }`);

    expect(diagram.lines).toEqual([
      expect.objectContaining({ type: "line", strokeStyle: "dashed" }),
    ]);
  });

  it("keeps the font size states were laid out with", async () => {
    const diagram = await parseState(`stateDiagram-v2
  [*] --> Idle`);

    expect(diagram.nodes.find(({ id }) => id === "Idle")?.fontSize).toBe(20);
  });
});

describe("z-order and fills", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const convert = async (definition: string) =>
    graphToExcalidraw(await parsePele(definition)).elements as any[];
  const lastArrow = (elements: any[]) =>
    elements.map((element) => element.type).lastIndexOf("arrow");
  const firstArrow = (elements: any[]) =>
    elements.findIndex((element) => element.type === "arrow");

  it("draws flowchart nodes, opaque, above edges, and subgraphs below", async () => {
    const elements = await convert(`flowchart LR
  subgraph S [Group]
    A[Alpha] --> B{Beta}
  end
  B --> C((Gamma))`);
    const node = (id: string) => elements.find((element) => element.id === id);

    ["A", "B", "C"].forEach((id) => {
      expect(node(id).backgroundColor).toBe(NODE_BACKGROUND_COLOR);
      expect(elements.indexOf(node(id))).toBeGreaterThan(lastArrow(elements));
    });
    expect(elements.indexOf(node("S"))).toBeLessThan(firstArrow(elements));
    // not grouped with their subgraph: Excalidraw would keep the group
    // together in z-order, below arrows drawn after it
    elements.forEach((element) => expect(element.groupIds ?? []).toEqual([]));
  });

  it("draws flowchart subgraph titles above edges, on a band as wide as them", async () => {
    const elements = await convert(`flowchart TB
  X --> A
  subgraph S [Group]
    A[Alpha] --> B[Beta]
    C[Gamma]
  end
  style S fill:#fee`);
    const subgraph = elements.find((element) => element.id === "S");
    const title = elements.find((element) => element.id === "S__title");

    expect(subgraph.label).toBeUndefined();
    expect(title).toMatchObject({
      label: { text: "Group" },
      backgroundColor: "#fee",
      strokeColor: "transparent",
      // hand-drawn, its fill would wobble over the subgraph's stroke
      roughness: 0,
    });
    expect(elements.indexOf(title)).toBeGreaterThan(lastArrow(elements));
    expect(elements.indexOf(title)).toBeLessThan(
      elements.findIndex((element) => element.id === "A")
    );
    // centered, and narrower than the subgraph: edges entering it beside
    // the title aren't hidden
    expect(title.width).toBeLessThan(subgraph.width / 2);
    expect(title.x + title.width / 2).toBeCloseTo(
      subgraph.x + subgraph.width / 2
    );
    expect(title.y).toBeGreaterThan(subgraph.y);
  });

  it("keeps styled fills", async () => {
    const elements = await convert(`flowchart LR
  A --> B
  style A fill:#f96`);
    expect(elements.find((element) => element.id === "A").backgroundColor).toBe(
      "#f96"
    );
  });

  it("draws classes and entities, opaque, above the arrows between them", async () => {
    for (const definition of [
      `classDiagram
  Animal <|-- Duck
  Animal : +int age`,
      `erDiagram
  CUSTOMER ||--o{ ORDER : places`,
    ]) {
      const elements = await convert(definition);
      const boxes = elements.filter(
        (element) => element.type === "rectangle" && element.label?.text
      );
      expect(boxes.length).toBeGreaterThan(0);
      boxes.forEach((box) => {
        expect(box.backgroundColor).toBe(NODE_BACKGROUND_COLOR);
        expect(elements.indexOf(box)).toBeGreaterThan(lastArrow(elements));
      });
    }
  });

  it("draws states, opaque, above transitions, and composite states below", async () => {
    const elements = await convert(`stateDiagram-v2
  [*] --> Outer
  state Outer {
    [*] --> Inner
    Inner --> Done
  }`);
    const byText = (text: string) =>
      elements.find((element) => element.label?.text === text);

    // the composite's box behind the transitions, its title above them
    const composite = elements.find((element) => element.id === "Outer");
    const title = elements.find((element) => element.id === "Outer__title");
    expect(composite.label).toBeUndefined();
    expect(elements.indexOf(composite)).toBeLessThan(firstArrow(elements));
    expect(title).toMatchObject({
      label: { text: "Outer", strokeColor: "#1e1e1e" },
      backgroundColor: NODE_BACKGROUND_COLOR,
      strokeColor: "transparent",
    });
    expect(elements.indexOf(title)).toBeGreaterThan(lastArrow(elements));
    ["Inner", "Done"].forEach((text) => {
      expect(byText(text).backgroundColor).toBe(NODE_BACKGROUND_COLOR);
      expect(elements.indexOf(byText(text))).toBeGreaterThan(
        lastArrow(elements)
      );
    });
  });
});
