import { NODE_BACKGROUND_COLOR } from "../src/constants.js";
import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parseDiagram } from "../src/parseDiagram.js";
import {
  isSteppedDefinition,
  parsePele,
  renderPeleSvg,
} from "../src/pele/parsePele.js";
import {
  evenOutRoute,
  getRoutePosition,
  lengthenRouteEnds,
  parsePath,
  parseSvg,
  simplifyRoute,
} from "../src/pele/svg.js";
import { parsePeleFlowchart } from "../src/pele/flowchart.js";
import { hasOverlappingTasks, parsePeleGantt } from "../src/pele/gantt.js";
import { countOverlaps } from "../src/pele/quadrant.js";
import { load, parse, render, type FlowchartModel } from "pele/lazy";
import type {
  Flowchart,
  MermaidConfig,
  Sequence,
  Class,
  ERD,
  State,
  Gantt,
  GanttTask,
  QuadrantChart,
  QuadrantPoint,
  Timeline,
  Box,
} from "../src/interfaces.js";
import { getTestCase, testcasesOfType } from "../testcases/testcases.ts";

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

  it("reads arc parameters and treats coordinates after a moveto as linetos", () => {
    const segments = parsePath("M-29.11,-24A29.11,6 0 0 1 29.11,-24V24");
    expect(segments.map(({ points }) => points[points.length - 1])).toEqual([
      { x: -29.11, y: -24 },
      { x: 29.11, y: -24 },
      { x: 29.11, y: 24 },
    ]);
    expect(segments[1].arc).toEqual({
      rx: 29.11,
      ry: 6,
      rotation: 0,
      largeArc: false,
      sweep: true,
    });
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
  beforeAll(async () => {
    // jsdom has no canvas (and logs that it doesn't): Pele falls back to its
    // built-in text metrics either way.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    // for the tests that parse with Pele directly
    await load("flowchart");
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("flowchart playground examples", () => {
    const testcases = testcasesOfType("flowchart");

    it.each(testcases.map((testcase) => [testcase.id, testcase]))(
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

  describe("stepped edges", () => {
    const definition = `flowchart TD
  A[Start] --> B{Ok?}
  B -->|yes| C[Do]
  B -->|no| D((End))
  C --> D
  A --> E[Side]`;
    // 1 on the outline
    const getDistance = (vertex: Flowchart["vertices"][string], point: any) =>
      vertex!.type === "diamond"
        ? Math.abs(point.x - (vertex!.x + vertex!.width / 2)) /
            (vertex!.width / 2) +
          Math.abs(point.y - (vertex!.y + vertex!.height / 2)) /
            (vertex!.height / 2)
        : Math.hypot(
            (point.x - (vertex!.x + vertex!.width / 2)) / (vertex!.width / 2),
            (point.y - (vertex!.y + vertex!.height / 2)) / (vertex!.height / 2)
          );

    it("draws them as elbow arrows along Pele's routes, onto diamonds' and circles' outline", async () => {
      const flowchart = (await parsePele(definition, {
        curve: "step",
      })) as Flowchart;

      expect(flowchart.edges).toHaveLength(5);
      flowchart.edges.forEach(
        ({ start, end, reflectionPoints, orthogonal }) => {
          expect(orthogonal).toBe(true);
          // turning at every point, not split
          reflectionPoints.slice(1).forEach((point, index) => {
            const previous = reflectionPoints[index];
            const vertical = Math.abs(point.x - previous.x) < 0.5;
            expect(vertical || Math.abs(point.y - previous.y) < 0.5).toBe(true);
            const next = reflectionPoints[index + 2];
            if (next) {
              expect(Math.abs(next.x - point.x) < 0.5).toBe(!vertical);
            }
          });
          [
            [start, reflectionPoints[0]],
            [end, reflectionPoints[reflectionPoints.length - 1]],
          ].forEach(([id, point]) => {
            const vertex = flowchart.vertices[id as string]!;
            if (vertex.type === "diamond" || vertex.type === "circle") {
              expect(getDistance(vertex, point)).toBeCloseTo(1, 2);
            }
          });
        }
      );

      const arrows = (graphToExcalidraw(flowchart).elements as any[]).filter(
        ({ type }) => type === "arrow"
      );
      expect(arrows).toHaveLength(5);
      arrows.forEach((arrow) =>
        expect(arrow).toMatchObject({ elbowed: true, roundness: null })
      );
    });

    it("draws them so when the definition asks for them", async () => {
      const flowchart = await parseFlowchart(
        `%%{init: {"flowchart": {"curve": "step"}}}%%\n${definition}`
      );
      expect(flowchart.edges.every(({ orthogonal }) => orthogonal)).toBe(true);
    });

    it("draws them so when they're all straight (with no corners to tell)", async () => {
      const straight = "flowchart LR\nA -- text --> B -- text2 --> C";
      for (const [definition, curve, orthogonal] of [
        [straight, "step", true],
        [
          `%%{init: {"flowchart": {"curve": "step"}}}%%\n${straight}`,
          undefined,
          true,
        ],
        [
          `---\nconfig:\n  flowchart:\n    curve: step\n---\n${straight}`,
          undefined,
          true,
        ],
        [
          `---\nconfig: {flowchart: {curve: step}}\n---\n${straight}`,
          undefined,
          true,
        ],
        [
          `---\nconfig: {themeCSS: " #foo {}", flowchart: {curve: step}}\n---\n${straight}`,
          undefined,
          true,
        ],
        [`---\nmetadata: [owner: Alice]\n---\n${straight}`, "step", true],
        [
          `---\n# %%{init: {"flowchart": {"curve": "linear"}}}%%\nconfig: {flowchart: {curve: step}}\n---\n${straight}`,
          undefined,
          true,
        ],
        [
          `  ---\n  config:\n    flowchart:\n      curve: step\n  ---\n${straight}`,
          undefined,
          true,
        ],
        // the definition's curve wins
        [
          `%%{init: {"flowchart": {"curve": "linear"}}}%%\n${straight}`,
          "step",
          false,
        ],
        [straight, undefined, false],
      ] as const) {
        const flowchart = (await parsePele(definition, { curve })) as Flowchart;
        expect(flowchart.edges).toHaveLength(2);
        flowchart.edges.forEach((edge) =>
          expect(!!edge.orthogonal).toBe(orthogonal)
        );
      }
    });

    it("tells whether Pele steps edges by its config, as it merges them", async () => {
      const bent = "flowchart TD\nA --> B\nA --> C";
      const frontMatter = (yaml: string) => `---\nconfig:\n${yaml}\n---\n`;
      const init = (json: string) => `%%{init: ${json}}%%\n`;
      const step = '{"flowchart": {"curve": "step"}}';
      const linear = '{"flowchart": {"curve": "linear"}}';
      const cases: [string, string | undefined][] = [
        [frontMatter("  flowchart:\n    curve: step"), undefined],
        // directives over front matter, the last one first
        [
          frontMatter("  flowchart:\n    curve: linear") + init(step),
          undefined,
        ],
        [
          frontMatter("  flowchart:\n    curve: step") + init(linear),
          undefined,
        ],
        [init(step) + init(linear), undefined],
        [init(linear) + init(step), undefined],
        // merged with each other
        [
          frontMatter("  flowchart:\n    curve: step") +
            init('{"flowchart": {"nodeSpacing": 10}}'),
          undefined,
        ],
        // read in comments, and after the diagram
        [`%% ${init(step)}`, undefined],
        [`${bent}\n${init(step)}`, undefined],
        // but not YAML comments
        [
          frontMatter("  flowchart:\n    # curve: step\n    nodeSpacing: 10"),
          undefined,
        ],
        ["%%{init: {'flowchart': {'curve': 'step'}}}%%\n", undefined],
        ['%%{initialize: {"flowchart": {"curve": "step"}}}%%\n', undefined],
        // JSON only (unquoted keys are ignored)
        ["%%{init: {flowchart: {curve: step}}}%%\n", undefined],
        [
          '%%{init: {\n  "flowchart": {\n    "curve": "step"\n  }\n}}%%\n',
          undefined,
        ],
        // YAML flow mappings, over lines too, quoted keys, any indentation
        ["---\nconfig: {flowchart: {curve: step}}\n---\n", undefined],
        ['---\nconfig: {"flowchart": {"curve": "step"}}\n---\n', undefined],
        ["---\nconfig: {\n  flowchart: {curve: step}\n}\n---\n", undefined],
        [frontMatter("  flowchart: {curve: step}"), undefined],
        [
          "---\nconfig: {theme: dark, themeCSS: [a, b], flowchart: {nodeSpacing: 10, curve: step}}\n---\n",
          undefined,
        ],
        ['---\nconfig:\n  "flowchart":\n    "curve": "step"\n---\n', undefined],
        [
          "---\ntitle: x\nconfig:\n    flowchart:\n        curve: step # why\n---\n",
          undefined,
        ],
        // a directive in a YAML comment is no directive
        [
          '---\n# %%{init: {"flowchart": {"curve": "linear"}}}%%\nconfig: {flowchart: {curve: step}}\n---\n',
          undefined,
        ],
        // indented front matter
        [
          "  ---\n  config:\n    flowchart:\n      curve: step\n  ---\n",
          undefined,
        ],
        // YAML that's no config, or quoted
        ["---\nmetadata: [owner: Alice]\n---\n", "step"],
        [
          '---\nconfig: {themeCSS: " #foo {}", flowchart: {curve: step}}\n---\n',
          undefined,
        ],
        [
          '---\nconfig: {themeCSS: ".a { content: \\"x\\" }", flowchart: {curve: step}}\n---\n',
          undefined,
        ],
        // not a mapping without the space
        [frontMatter("  flowchart:\n    curve:step"), undefined],
        ["---\nconfig: {flowchart: {nodeSpacing: 10}}\n---\n", "step"],
        // only under `flowchart`
        [frontMatter("  curve: step"), undefined],
        // replacing the caller's whole `flowchart` config
        [frontMatter("  flowchart:\n    nodeSpacing: 10"), "step"],
        [frontMatter("  theme: neutral"), "step"],
        ["", "step"],
      ];
      for (const [head, curve] of cases) {
        const definition = head.includes(bent) ? head : head + bent;
        const svg = await renderPeleSvg(definition, { curve });
        // (as `parsePele` asks, its default curve being "linear")
        const config = { flowchart: { curve: curve ?? "linear" } };
        expect([definition, isSteppedDefinition(definition, config)]).toEqual([
          definition,
          /Q\d/.test(svg),
        ]);
      }
    });

    it("asks Pele about the definition as it parsed it (with `<br>` replaced)", async () => {
      const flowchart = (await parsePele(
        '%%{init: {"flowchart": {"curve": "step"}}}%%\nflowchart LR\nWeb<br>app --> API'
      )) as Flowchart;
      expect(flowchart.edges).toHaveLength(1);
      expect(flowchart.edges[0].orthogonal).toBe(true);
    });

    it("asks Pele about its config only when the drawing doesn't tell", () => {
      const config = { flowchart: { curve: "step" } };
      for (const [definition, isAsked] of [
        // stepped corners
        ["flowchart TD\nA --> B\nA --> C", false],
        // straight edges
        ["flowchart LR\nA --> B --> C", true],
        // edges with their own curve only
        [
          "flowchart LR\nA --> B --> C\nlinkStyle default interpolate step",
          false,
        ],
      ] as const) {
        const model = parse(definition, { config }) as FlowchartModel;
        const root = parseSvg(
          render(model, { responsive: false, autoDirection: false, config }).svg
        );
        const stepped = vi.fn(() => true);
        parsePeleFlowchart(model, root, { fontSize: 20, stepped });
        expect([definition, stepped.mock.calls.length]).toEqual([
          definition,
          isAsked ? 1 : 0,
        ]);
      }
    });

    it("steps edges by their own curve (`linkStyle … interpolate`)", async () => {
      const own = (await parsePele(
        "flowchart LR\nA --> B --> C\nlinkStyle 0 interpolate step"
      )) as Flowchart;
      expect(own.edges.map(({ orthogonal }) => !!orthogonal)).toEqual([
        true,
        false,
      ]);

      // a stepped edge doesn't make the others stepped
      const bentOwn = (await parsePele(
        "flowchart TD\nA --> B\nA --> C\nD --> E\nlinkStyle 0,1 interpolate step"
      )) as Flowchart;
      expect(bentOwn.edges.map(({ orthogonal }) => !!orthogonal)).toEqual([
        true,
        true,
        false,
      ]);
    });

    it("keeps elbow arrows orthogonal around a subgraph widened for its title", async () => {
      const flowchart = (await parsePele(
        `flowchart TD
  A --> B
  C --> A
  A --> X
  subgraph grp[Title line one<br>line two]
    B --> C
  end`,
        { curve: "step" }
      )) as Flowchart;
      const arrows = (graphToExcalidraw(flowchart).elements as any[]).filter(
        ({ type }) => type === "arrow"
      );
      expect(arrows).toHaveLength(4);
      arrows.forEach((arrow) => {
        expect(arrow.elbowed).toBe(true);
        (arrow.points as [number, number][])
          .slice(1)
          .forEach((point, index) => {
            const previous = arrow.points[index];
            expect(
              Math.abs(point[0] - previous[0]) < 0.5 ||
                Math.abs(point[1] - previous[1]) < 0.5
            ).toBe(true);
          });
      });
    });

    it("curves an edge into a shape enlarged past its route's first corner", () => {
      const config = { flowchart: { curve: "step" } };
      const model = parse(
        "flowchart TD\n  A --> B\n  A --> C((Some long label))",
        { config }
      ) as FlowchartModel;
      const root = parseSvg(
        render(model, {
          responsive: false,
          autoDirection: false,
          fontSize: 20,
          config,
        }).svg
      );
      const flowchart = parsePeleFlowchart(model, root, {
        fontSize: 20,
        // past the corner above it, short of A
        measureText: (text) => text.length * 11,
      });

      const [ab, ac] = flowchart.edges;
      expect(ab.orthogonal).toBe(true);
      expect(ac.orthogonal).toBeUndefined();
      expect(
        getDistance(flowchart.vertices.C, { x: ac.endX, y: ac.endY })
      ).toBeCloseTo(1, 2);
    });
  });

  it("bounds cylinders by their caps, where their edges end", async () => {
    const flowchart = await parseFlowchart(
      "flowchart TD\n  A --> B[(Database)]"
    );
    const { B } = flowchart.vertices;
    const [edge] = flowchart.edges;
    // the top cap bulges above where its sides start
    expect(edge.endY).toBeCloseTo(B!.y, 0);
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

  it("keeps diamonds at Pele's size, wrapping their label anew in them", () => {
    const model = parse(
      "flowchart LR\n  C{This is the text in the box}"
    ) as FlowchartModel;
    const root = parseSvg(
      render(model, { responsive: false, autoDirection: false, fontSize: 20 })
        .svg
    );
    // Pele wrapped it
    expect(
      root.querySelectorAll(".pele-label tspan[y]").length
    ).toBeGreaterThan(1);
    const original = parsePeleFlowchart(model, root, { fontSize: 20 });
    const { C } = parsePeleFlowchart(model, root, {
      fontSize: 20,
      // "This is the text in the box": 189px; Excalidraw fits it, wrapped,
      // in half the diamond, minus padding
      measureText: (text) => text.length * 7,
    }).vertices;

    // without Pele's line breaks, for Excalidraw to wrap it in the diamond
    expect(C!.text).toBe("This is the text in the box");
    expect(C).toMatchObject({
      x: original.vertices.C!.x,
      y: original.vertices.C!.y,
      width: original.vertices.C!.width,
      height: original.vertices.C!.height,
    });
  });

  it("enlarges diamonds a bit to keep a word from being alone on the last line", () => {
    const model = parse("flowchart LR\n  C{Decision 1}") as FlowchartModel;
    const root = parseSvg(
      render(model, { responsive: false, autoDirection: false, fontSize: 20 })
        .svg
    );
    const before = parsePeleFlowchart(model, root, { fontSize: 20 }).vertices
      .C!;
    const measureText = (text: string) => text.length * 9;
    // too narrow for it on a single line
    expect(Math.round(before.width / 2) - 10).toBeLessThan(
      measureText("Decision 1")
    );

    const after = parsePeleFlowchart(model, root, { fontSize: 20, measureText })
      .vertices.C!;
    expect(Math.round(after.width / 2) - 10).toBeGreaterThanOrEqual(
      measureText("Decision 1")
    );
    expect(after.width / after.height).toBeCloseTo(
      before.width / before.height
    );
  });

  it("enlarges diamonds as little as Excalidraw needs, keeping their proportions", () => {
    const model = parse(
      "flowchart LR\n  C{Supercalifragilistic word}"
    ) as FlowchartModel;
    const root = parseSvg(
      render(model, { responsive: false, autoDirection: false, fontSize: 20 })
        .svg
    );
    const before = parsePeleFlowchart(model, root, { fontSize: 20 }).vertices
      .C!;
    const measureText = (text: string) => text.length * 14;
    const after = parsePeleFlowchart(model, root, { fontSize: 20, measureText })
      .vertices.C!;

    // the longest word fits on a line, and not much more
    const maxWidth = Math.round(after.width / 2) - 10;
    expect(maxWidth).toBeGreaterThanOrEqual(
      measureText("Supercalifragilistic")
    );
    expect(maxWidth).toBeLessThan(measureText("Supercalifragilistic") + 10);
    expect(after.width / after.height).toBeCloseTo(
      before.width / before.height
    );
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
    const graph = await parsePele(
      getTestCase("unsupported-pie-chart").definition
    );

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

  it("reports errors at the end of a definition at the end of its last line", async () => {
    // as Mermaid does (Excalidraw highlights and tries fixing that line),
    // instead of on an empty line after it
    for (const ending of ["", "\n", "\n  \n"]) {
      await expect(
        parsePele(
          `classDiagram\n  class Animal {\n    +int age\n  Animal <|-- Duck${ending}`
        )
      ).rejects.toMatchObject({
        message: expect.stringMatching(
          /^Parse error on line 4:\n {2}Animal <\|-- Duck\n-{18}\^\nExpecting/
        ),
        line: 4,
        column: 19,
      });
    }
    // on the definition's own line, counting its comments (Mermaid doesn't)
    await expect(
      parsePele(
        `%% a comment\n%% another\nclassDiagram\n  class Animal {\n    +int age\n  Animal <|-- Duck\n`
      )
    ).rejects.toMatchObject({
      message: expect.stringMatching(
        /^Parse error on line 6:\n {2}Animal <\|-- Duck\n-{18}\^\n/
      ),
      line: 6,
    });
    // errors elsewhere are kept as they are
    await expect(
      parsePele("flowchart TD\n  A[Process (main)] --> B\n  B --> C")
    ).rejects.toMatchObject({
      message: expect.stringMatching(
        /^Parse error on line 2:\n {2}A\[Process \(main\)\] --> B\n-{12}\^\n/
      ),
      line: 2,
    });
  });
});

describe("parsePele swimlanes", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const swimlanes = (direction: string) => `swimlane-beta ${direction}
  subgraph Customer
    A[Start] --> B[Browse]
  end
  subgraph Sales [Sales team]
    C[Order]
  end
  B --> C`;

  it.each(
    testcasesOfType("swimlane").map((testcase) => [testcase.id, testcase])
  )("%s", async (_, { definition }) => {
    const flowchart = await parseFlowchart(definition);
    expect(flowchart.subGraphs.length).toBeGreaterThan(0);
    flowchart.subGraphs.forEach((lane) => expect(lane.laneHeader).toBeTruthy());
    expect(graphToExcalidraw(flowchart).elements.length).toBeGreaterThan(0);
  });

  it("reads lanes' headers: a column on their side, or a row on their top", async () => {
    const leftToRight = await parseFlowchart(swimlanes("LR"));
    leftToRight.subGraphs.forEach((lane) => {
      expect(lane.laneHeader).toEqual({
        x: lane.x,
        y: lane.y,
        width: expect.any(Number),
        height: lane.height,
        vertical: true,
      });
      expect(lane.laneHeader!.width).toBeLessThan(lane.width / 2);
    });
    expect(leftToRight.subGraphs.map(({ text }) => text).sort()).toEqual([
      "Customer",
      "Sales team",
    ]);

    const topToBottom = await parseFlowchart(swimlanes("TB"));
    topToBottom.subGraphs.forEach((lane) => {
      expect(lane.laneHeader).toEqual({
        x: lane.x,
        y: lane.y,
        width: lane.width,
        height: expect.any(Number),
        vertical: false,
      });
      expect(lane.laneHeader!.height).toBeLessThan(lane.height / 2);
    });
  });

  it("draws edges as elbow arrows along Pele's (orthogonal) routes", async () => {
    // (with a route around: "no", back to the start)
    const flowchart = await parseFlowchart(
      getTestCase("swimlane-top-to-bottom-with-titles").definition
    );
    const arrows = (graphToExcalidraw(flowchart).elements as any[]).filter(
      ({ type }) => type === "arrow"
    );
    expect(arrows.length).toBe(flowchart.edges.length);
    arrows.forEach((arrow) => {
      const edge = flowchart.edges.find(
        ({ start, end }) => `${start}_${end}` === arrow.id
      )!;
      expect(edge.orthogonal).toBe(true);
      expect(arrow).toMatchObject({ elbowed: true, roundness: null });
      // along Pele's route, its middle segments fixed there
      expect(arrow.points).toHaveLength(edge.reflectionPoints.length);
      expect(arrow.fixedSegments).toHaveLength(
        Math.max(0, arrow.points.length - 3)
      );
      arrow.fixedSegments.forEach(({ start, end, index }: any) => {
        expect(start).toEqual(arrow.points[index - 1]);
        expect(end).toEqual(arrow.points[index]);
      });
    });
    expect(arrows.some(({ fixedSegments }) => fixedSegments.length)).toBe(true);
    // not flowcharts'
    const plain = await parseFlowchart("flowchart LR\n  A --> B\n  A --> C");
    expect(plain.edges.every(({ orthogonal }) => !orthogonal)).toBe(true);
  });

  it("draws lanes' titles in their header, reading upwards in a column", async () => {
    const flowchart = await parseFlowchart(swimlanes("LR"));
    const { elements } = graphToExcalidraw(flowchart) as { elements: any[] };
    const lane = flowchart.subGraphs.find(({ id }) => id === "Sales")!;
    const headerWidth = lane.laneHeader!.width;
    const box = elements.find((element) => element.id === "Sales");
    const title = elements.find((element) => element.id === "Sales__title");

    // as laid out (not widened for its title, which isn't on its top)
    expect(box).toMatchObject({ x: lane.x, width: lane.width });
    expect(box.label).toBeUndefined();
    // turned around its center to fill the header column
    expect(title).toMatchObject({
      angle: (3 * Math.PI) / 2,
      width: box.height,
      height: headerWidth,
      label: { text: "Sales team", angle: (3 * Math.PI) / 2 },
    });
    expect(title.x + title.width / 2).toBeCloseTo(box.x + headerWidth / 2);
    expect(title.y + title.height / 2).toBeCloseTo(box.y + box.height / 2);
    // and the line between the header and the lane's content
    expect(elements).toContainEqual(
      expect.objectContaining({
        type: "line",
        x: box.x + headerWidth,
        y: box.y,
        height: box.height,
      })
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
    testcasesOfType("sequence").map((testcase) => [testcase.id, testcase])
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

  it.each(testcasesOfType("class").map((testcase) => [testcase.id, testcase]))(
    "%s",
    async (_, { definition }) => {
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
    }
  );

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

  it("ends relations on the class outline, past Pele's step back into their marker", async () => {
    const diagram = await parseClassDiagram(`classDiagram
  direction LR
  class Student {
    -idCard : IdCard
  }
  class IdCard {
    -id : int
  }
  Student "1" --o "1" IdCard : carries
  Student "1" --* "1" Bike : rides`);

    diagram.arrows.forEach(({ endX, endY, end }) => {
      const box = diagram.nodes[0].find(({ id }) => id === end?.id)!;
      expect(endX).toBeCloseTo(box.x, 0);
      expect(endY).toBeGreaterThan(box.y);
      expect(endY).toBeLessThan(box.y + box.height!);
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
    // where Pele drew it
    expect(diagram.arrows[0].label?.labelPosition).toBeGreaterThan(0);
    expect(diagram.arrows[0].label?.labelPosition).toBeLessThan(1);
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
    // where Pele drew it, around its class
    const square = diagram.nodes[0].find(({ id }) => id === "Square")!;
    expect(diagram.namespaces).toEqual([
      expect.objectContaining({ id: "Shapes", text: "Shapes" }),
    ]);
    const [namespace] = diagram.namespaces;
    expect(namespace.x).toBeLessThan(square.x);
    expect(namespace.y).toBeLessThan(square.y);
    expect(namespace.x + namespace.width).toBeGreaterThan(
      square.x + square.width!
    );
    expect(namespace.y + namespace.height).toBeGreaterThan(
      square.y + square.height!
    );
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

  it.each(testcasesOfType("erd").map((testcase) => [testcase.id, testcase]))(
    "%s",
    async (_, { definition }) => {
      const diagram = await parseERD(definition);

      expect(diagram.nodes[0].length).toBeGreaterThan(0);
      diagram.arrows.forEach((arrow) => {
        expect(arrow.points!.length).toBeGreaterThanOrEqual(2);
      });
      expect(graphToExcalidraw(diagram).elements.length).toBeGreaterThan(0);
    }
  );

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
    // where Pele drew them
    diagram.arrows.forEach(({ label }) => {
      expect(label?.labelPosition).toBeGreaterThan(0);
      expect(label?.labelPosition).toBeLessThan(1);
    });
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

  it.each(testcasesOfType("state").map((testcase) => [testcase.id, testcase]))(
    "%s",
    async (_, { definition }) => {
      const diagram = await parseState(definition);
      const ids = new Set(diagram.nodes.map(({ id }) => id));

      expect(diagram.nodes.length).toBeGreaterThan(0);
      diagram.edges.forEach((edge) => {
        expect(ids.has(edge.start)).toBe(true);
        expect(ids.has(edge.end)).toBe(true);
        expect(edge.reflectionPoints.length).toBeGreaterThanOrEqual(2);
      });
      expect(graphToExcalidraw(diagram).elements.length).toBeGreaterThan(0);
    }
  );

  it("draws stepped transitions as elbow arrows along Pele's routes", async () => {
    const definition = getTestCase("state-stepped-edges").definition;
    const stepped = await parseState(definition);

    expect(stepped.edges.length).toBeGreaterThan(5);
    stepped.edges.forEach(({ reflectionPoints, orthogonal }) => {
      expect(orthogonal).toBe(true);
      reflectionPoints.slice(1).forEach((point, index) => {
        const previous = reflectionPoints[index];
        expect(
          Math.abs(point.x - previous.x) < 0.5 ||
            Math.abs(point.y - previous.y) < 0.5
        ).toBe(true);
      });
    });
    const arrows = (graphToExcalidraw(stepped).elements as any[]).filter(
      ({ type }) => type === "arrow"
    );
    expect(arrows.length).toBeGreaterThan(5);
    arrows.forEach((arrow) =>
      expect(arrow).toMatchObject({ elbowed: true, roundness: null })
    );

    // not without the curve
    const curved = await parseState(definition.replace(/^%%\{init.*\n/, ""));
    expect(curved.edges.some(({ orthogonal }) => orthogonal)).toBe(false);
  });

  it("draws stepped transitions so when they're all straight", async () => {
    const definition = `stateDiagram-v2
    [*] --> Session
    state Session {
      [*] --> Ready
      Ready --> Busy
      Busy --> Ready
    }`;
    const stepped = (await parsePele(definition, { curve: "step" })) as State;
    expect(stepped.edges).toHaveLength(4);
    stepped.edges.forEach(({ orthogonal }) => expect(orthogonal).toBe(true));
    const arrows = (graphToExcalidraw(stepped).elements as any[]).filter(
      ({ type }) => type === "arrow"
    );
    arrows.forEach((arrow) => expect(arrow.elbowed).toBe(true));

    const curved = await parseState(definition);
    expect(curved.edges.some(({ orthogonal }) => orthogonal)).toBe(false);
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

describe("parsePele gantt charts", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const parseGantt = async (definition: string) => {
    const graph = await parsePele(definition);
    expect(graph.type).toBe("gantt");
    return graph as Gantt;
  };

  it.each(testcasesOfType("gantt").map((testcase) => [testcase.id, testcase]))(
    "%s",
    async (_, { definition }) => {
      const chart = await parseGantt(definition);

      expect(chart.tasks.length).toBeGreaterThan(0);
      chart.tasks.forEach(({ box }) => {
        expect(box && box.width > 0 && box.height > 0).toBe(true);
      });
      expect(graphToExcalidraw(chart).elements.length).toBeGreaterThan(0);
    }
  );

  const CHART = `gantt
  title Release
  dateFormat YYYY-MM-DD
  todayMarker off
  section Build
    Implement the feature :impl, 2024-05-06, 20d
    Docs :done, crit, docs, 2024-05-20, 1d
    Review :active, review, after impl, 3d
  section Ship
    Shipped :milestone, shipped, after review, 0d
  click impl href "https://example.com/impl"`;

  it("reads tasks' bars, statuses, names (in or next to their bar) and links", async () => {
    const chart = await parseGantt(CHART);
    const tasks = new Map(chart.tasks.map((task) => [task.id, task]));

    expect(chart.title?.text).toBe("Release");
    expect(chart.sectionLabels.map(({ text }) => text)).toEqual([
      "Build",
      "Ship",
    ]);
    expect(tasks.get("impl")).toMatchObject({
      shape: "bar",
      crit: false,
      label: { inside: true, text: { text: "Implement the feature" } },
      link: "https://example.com/impl",
    });
    expect(tasks.get("docs")).toMatchObject({
      shape: "bar",
      status: "done",
      crit: true,
      // a day is too short for its name
      label: { inside: false, text: { text: "Docs" } },
    });
    expect(tasks.get("review")).toMatchObject({ status: "active" });
    expect(tasks.get("shipped")).toMatchObject({
      shape: "milestone",
      label: { inside: false, text: { text: "Shipped" } },
    });

    // on the same time scale: review starts where impl ends
    const impl = tasks.get("impl")!.box!;
    const review = tasks.get("review")!.box!;
    expect(review.x).toBeCloseTo(impl.x + impl.width, 0);
    expect(review.y).toBeGreaterThan(impl.y);
    expect(chart.axisLabels.length).toBeGreaterThan(1);
    expect(chart.axisLines.length).toBe(1);
  });

  it("binds names to the bars they fit in, and groups the others with theirs", async () => {
    const chart = await parseGantt(CHART);
    const { elements } = graphToExcalidraw(chart);
    const shapes = elements.filter(
      (element) => element.type === "rectangle" || element.type === "diamond"
    );

    const impl = shapes.find(
      (element) =>
        element.type === "rectangle" &&
        element.label?.text === "Implement the feature"
    );
    expect(impl).toMatchObject({ link: "https://example.com/impl" });

    const docs = elements.find(
      (element) => element.type === "text" && element.text === "Docs"
    );
    const docsBar = shapes.find(
      (element) =>
        element.groupIds?.length &&
        element.groupIds[0] === (docs as { groupIds?: string[] }).groupIds?.[0]
    );
    expect(docsBar).toMatchObject({
      type: "rectangle",
      strokeColor: "#e03131",
    });

    const milestone = shapes.find((element) => element.type === "diamond");
    expect(milestone?.width).toBe(milestone?.height);
  });

  it("links only the right one of a task's shape and the name next to it", async () => {
    const linked = (elements: readonly { link?: string | null }[]) =>
      elements.filter(({ link }) => link);

    // the opening milestone's name is on its left
    const museum = graphToExcalidraw(
      await parseGantt(
        getTestCase("gantt-scheduling-museum-exhibition-installation")
          .definition
      )
    ).elements;
    expect(linked(museum)).toEqual([
      expect.objectContaining({
        type: "diamond",
        link: "https://example.org/exhibitions/tides",
      }),
    ]);

    // a day's bar is too short for its name, which is on its right
    const short = graphToExcalidraw(
      await parseGantt(`gantt
  dateFormat YYYY-MM-DD
  todayMarker off
  section A
    Long :long, 2024-05-06, 20d
    Short :short, 2024-05-06, 1d
  click short href "https://example.com/short"`)
    ).elements;
    expect(linked(short)).toEqual([
      expect.objectContaining({
        type: "text",
        text: "Short",
        link: "https://example.com/short",
      }),
    ]);
  });

  describe("displayMode: compact", () => {
    const getRows = (chart: Gantt) =>
      new Set(chart.tasks.map(({ box }) => Math.round(box!.y))).size;

    it("keeps tasks sharing rows where they fit", async () => {
      const chart = await parseGantt(
        getTestCase("gantt-compact-mode").definition
      );

      expect(getRows(chart)).toBeLessThan(chart.tasks.length);
      expect(hasOverlappingTasks(chart)).toBe(false);
    });

    it("gives every task its row where names next to bars would overlap", async () => {
      const definition = getTestCase(
        "gantt-organizing-community-music-festival"
      ).definition;
      const chart = await parseGantt(definition);

      expect(getRows(chart)).toBe(chart.tasks.length);
      // the reference SVG is laid out the same way
      const reference = parsePeleGantt(
        parseSvg(await renderPeleSvg(definition)),
        { fontSize: 20 }
      );
      expect(getRows(reference)).toBe(reference.tasks.length);
    });

    it("tells names next to bars running into the next task in their row", () => {
      const task = (
        id: string,
        x: number,
        width: number,
        labelX?: number
      ): GanttTask => ({
        id,
        shape: "bar",
        box: { x, y: 0, width, height: 30 },
        crit: false,
        label: {
          inside: labelX === undefined,
          text: {
            type: "text",
            text: id,
            x: labelX ?? x + width / 2,
            y: 5,
            fontSize: 16,
          },
        },
      });
      const chart = (...tasks: GanttTask[]) =>
        ({ type: "gantt", tasks } as unknown as Gantt);

      // bars touching
      expect(
        hasOverlappingTasks(chart(task("a", 0, 50), task("b", 50, 50)))
      ).toBe(false);
      // a's name, 40 wide, spans 58 to 98 (and its gap to 106)
      expect(
        hasOverlappingTasks(chart(task("a", 0, 50, 78), task("b", 120, 50)))
      ).toBe(false);
      expect(
        hasOverlappingTasks(chart(task("a", 0, 50, 78), task("b", 100, 50)))
      ).toBe(true);
      // b's name on its left, spanning 52 to 92
      expect(
        hasOverlappingTasks(chart(task("a", 0, 50), task("b", 100, 50, 72)))
      ).toBe(true);
      // in other rows
      const below = task("b", 60, 50);
      below.box!.y = 40;
      expect(hasOverlappingTasks(chart(task("a", 0, 50, 78), below))).toBe(
        false
      );
    });
  });

  it("draws sections and grid lines behind tasks, and labels above them", async () => {
    const { elements } = graphToExcalidraw(await parseGantt(CHART));
    const firstTask = elements.findIndex(
      (element) => element.type === "rectangle" && element.label
    );
    const lastIndex = (
      matches: (element: (typeof elements)[number]) => boolean
    ) => elements.length - 1 - [...elements].reverse().findIndex(matches);
    const lastBand = lastIndex(
      (element) =>
        element.type === "rectangle" && element.strokeColor === "transparent"
    );
    const lastLine = lastIndex(({ type }) => type === "line");
    const firstSectionLabel = elements.findIndex(
      (element) => element.type === "text" && element.text === "Build"
    );

    expect(lastBand).toBeGreaterThanOrEqual(0);
    expect(lastBand).toBeLessThan(lastLine);
    expect(lastLine).toBeLessThan(firstTask);
    expect(firstTask).toBeLessThan(firstSectionLabel);
  });

  it("reads excluded days, vertical markers and the top axis", async () => {
    const chart = await parseGantt(
      getTestCase("gantt-excludes-markers-and-links").definition
    );

    // the sprint's weekend
    expect(chart.excluded.length).toBe(1);
    expect(chart.verticals.length).toBe(1);
    expect(chart.verticalLabels.map(({ text }) => text)).toEqual([
      "Code freeze",
    ]);
    expect(chart.axisLines.length).toBe(2);
    expect(chart.today).toBeUndefined();
  });

  it("marks today, unless todayMarker is off", async () => {
    const span = `gantt
  dateFormat YYYY-MM-DD
  section All
    Century :c, 2000-01-01, 2100-01-01`;

    const marked = await parseGantt(span);
    expect(marked.today).toBeDefined();
    expect(marked.today!.startX).toBe(marked.today!.endX);

    const unmarked = await parseGantt(
      span.replace("gantt", "gantt\n  todayMarker off")
    );
    expect(unmarked.today).toBeUndefined();
  });

  it("keeps the today marker's style, if set", async () => {
    const span = `gantt
  dateFormat YYYY-MM-DD
  section All
    Century :c, 2000-01-01, 2100-01-01`;
    const today = (chart: Gantt) =>
      graphToExcalidraw(chart).elements.find(
        (element) =>
          element.type === "line" && element.x === chart.today?.startX
      );

    expect(today(await parseGantt(span))).toMatchObject({
      strokeColor: "#e03131",
      strokeWidth: 2,
    });
    const styled = await parseGantt(
      span.replace(
        "gantt",
        "gantt\n  todayMarker stroke-width:5px,stroke:#00ff00,opacity:0.5"
      )
    );
    expect(today(styled)).toMatchObject({
      strokeColor: "#00ff00",
      strokeWidth: 5,
      opacity: 50,
    });

    // styled to be invisible
    for (const style of [
      "stroke:none",
      "stroke:transparent",
      "stroke-width:0px",
      "opacity:0",
      "stroke-opacity:0",
    ]) {
      const hidden = await parseGantt(
        span.replace("gantt", `gantt\n  todayMarker ${style}`)
      );
      expect(hidden.today, style).toBeUndefined();
    }
    const faint = await parseGantt(
      span.replace(
        "gantt",
        "gantt\n  todayMarker opacity:0.5,stroke-opacity:0.5"
      )
    );
    expect(today(faint)).toMatchObject({ opacity: 25 });
    const percent = await parseGantt(
      span.replace(
        "gantt",
        "gantt\n  todayMarker opacity:50%,stroke-opacity:50%"
      )
    );
    expect(today(percent)).toMatchObject({ opacity: 25 });
    const hiddenPercent = await parseGantt(
      span.replace("gantt", "gantt\n  todayMarker opacity:0%")
    );
    expect(hiddenPercent.today).toBeUndefined();
  });

  it("draws names over bars too thin to bind them to", async () => {
    const chart = await parseGantt(`---
config:
  gantt:
    barHeight: 20
    barGap: 4
---
${CHART}`);
    const { elements } = graphToExcalidraw(chart);
    const bar = elements.find(
      (element) => element.type === "rectangle" && element.groupIds?.length
    );
    const name = elements.find(
      (element) =>
        element.type === "text" && element.text === "Implement the feature"
    );

    expect(chart.tasks[0].label.inside).toBe(true);
    expect(bar).toMatchObject({ height: 20 });
    expect(bar?.label).toBeUndefined();
    expect(name?.groupIds).toEqual(bar?.groupIds);
  });
});

describe("parsePele quadrant charts", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const parseQuadrant = async (definition: string) => {
    const graph = await parsePele(definition);
    expect(graph.type).toBe("quadrant");
    return graph as QuadrantChart;
  };

  it.each(
    testcasesOfType("quadrant").map((testcase) => [testcase.id, testcase])
  )("%s", async (_, { definition }) => {
    const chart = await parseQuadrant(definition);

    expect(chart.quadrants.length).toBe(4);
    chart.quadrants.forEach(({ box }) => expect(isFiniteBox(box)).toBe(true));
    expect(graphToExcalidraw(chart).elements.length).toBeGreaterThan(0);
  });

  const CHART = `quadrantChart
  title Campaigns
  x-axis Low Reach --> High Reach
  y-axis Low Engagement --> High Engagement
  quadrant-1 Expand
  quadrant-2 Promote
  quadrant-3 Re-evaluate
  quadrant-4 Improve
  Campaign A: [0.3, 0.6]
  Campaign B: [0.8, 0.2] radius: 10, color: #ff0000, stroke-color: #00ff00, stroke-width: 3px
  Campaign C:::warm: [0.6, 0.9]
  classDef warm color: #f08c00`;

  it("reads the quadrants in order, top right first, labeled", async () => {
    const { quadrants, title } = await parseQuadrant(CHART);
    const [q1, q2, q3, q4] = quadrants.map(({ box }) => box);

    expect(quadrants.map(({ label }) => label?.text)).toEqual([
      "Expand",
      "Promote",
      "Re-evaluate",
      "Improve",
    ]);
    expect(q1.x).toBeGreaterThan(q2.x);
    expect(q1.y).toBe(q2.y);
    expect(q3.y).toBeGreaterThan(q2.y);
    expect(q4.x).toBe(q1.x);
    expect(title?.text).toBe("Campaigns");
  });

  it("reads points where they're plotted, styled, with their names", async () => {
    const { quadrants, points } = await parseQuadrant(CHART);
    const [q1, , q3] = quadrants.map(({ box }) => box);
    const left = q3.x;
    const width = q1.x + q1.width - left;
    const top = q1.y;
    const height = q3.y + q3.height - top;
    const point = (name: string) =>
      points.find(({ label }) => label?.text === name)!;

    // drawn last to first, as Pele draws them
    expect(points.map(({ label }) => label?.text)).toEqual([
      "Campaign C",
      "Campaign B",
      "Campaign A",
    ]);
    expect(point("Campaign A").x).toBeCloseTo(left + 0.3 * width, 1);
    expect(point("Campaign A").y).toBeCloseTo(top + 0.4 * height, 1);
    expect(point("Campaign A")).toMatchObject({
      radius: 5,
      fill: undefined,
      stroke: undefined,
    });
    expect(point("Campaign B")).toMatchObject({
      radius: 10,
      fill: "#ff0000",
      stroke: { color: "#00ff00", width: 3 },
    });
    expect(point("Campaign C").fill).toBe("#f08c00");
    // a name is next to its point
    points.forEach(({ x, y, label }) => {
      expect(Math.abs(label!.x - x)).toBeLessThan(100);
      expect(Math.abs(label!.y - y)).toBeLessThan(50);
    });
  });

  it("turns the y axis' labels, centered where Pele drew them", async () => {
    const chart = await parseQuadrant(CHART);
    const [q1, , q3] = chart.quadrants.map(({ box }) => box);
    const label = (text: string) =>
      chart.axisLabels.find((candidate) => candidate.text === text)!;

    expect(label("Low Reach").angle).toBeUndefined();
    expect(label("Low Reach").y).toBeGreaterThan(q3.y + q3.height);
    ["Low Engagement", "High Engagement"].forEach((text) => {
      expect(label(text).angle).toBeCloseTo((3 * Math.PI) / 2);
      expect(label(text).textAlign).toBe("center");
      expect(label(text).x).toBeLessThan(q3.x);
    });
    const middle = (text: string) =>
      label(text).y + (label(text).height ?? 0) / 2;
    // (on the half of the axis, which takes in the gap between quadrants)
    expect(
      Math.abs(middle("High Engagement") - (q1.y + q1.height / 2))
    ).toBeLessThan(3);
    expect(
      Math.abs(middle("Low Engagement") - (q3.y + q3.height / 2))
    ).toBeLessThan(3);
  });

  it("converts quadrants with bound names, and groups points with theirs", async () => {
    const { elements } = graphToExcalidraw(await parseQuadrant(CHART));
    const quadrants = elements.filter(({ type }) => type === "rectangle");
    const ellipses = elements.filter(({ type }) => type === "ellipse");
    const name = (text: string) =>
      elements.find(
        (element) => element.type === "text" && element.text === text
      );

    expect(quadrants.map((element) => element.label?.text)).toEqual([
      "Expand",
      "Promote",
      "Re-evaluate",
      "Improve",
    ]);
    quadrants.forEach((element) =>
      expect(element.label?.verticalAlign).toBe("top")
    );
    expect(ellipses.length).toBe(3);
    const styled = ellipses.find(
      (element) => element.backgroundColor === "#ff0000"
    );
    expect(styled).toMatchObject({ strokeColor: "#00ff00", strokeWidth: 3 });
    expect(name("Campaign B")?.groupIds).toEqual(styled?.groupIds);
    expect(styled?.groupIds?.length).toBe(1);
    expect(name("Low Engagement")).toMatchObject({
      angle: expect.closeTo((3 * Math.PI) / 2),
    });
    // names above all points
    expect(elements.indexOf(name("Campaign A")!)).toBeGreaterThan(
      elements.indexOf(ellipses[ellipses.length - 1])
    );
  });

  it("centers quadrants' names when there are no points", async () => {
    const { elements } = graphToExcalidraw(
      await parseQuadrant(getTestCase("quadrant-without-points").definition)
    );
    elements
      .filter(({ type }) => type === "rectangle")
      .forEach((element) =>
        expect(element.label?.verticalAlign).toBe("middle")
      );
  });

  it.each([
    ["blank", " "],
    // (drawn by Pele, as a non-breaking space)
    ["a non-breaking space", "&nbsp;"],
  ])("keeps other points' names when a point's name is %s", async (_, name) => {
    const chart = await parseQuadrant(`quadrantChart
  Named A: [0.2, 0.3]
  "${name}": [0.8, 0.7]
  Named B: [0.5, 0.5]`);
    const nameAt = (x: number) =>
      chart.points.find((point) => Math.abs(point.x - x) < 1)?.label?.text;
    const [b, blank, a] = chart.points;

    expect(chart.points.length).toBe(3);
    expect(nameAt(a.x)).toBe("Named A");
    expect(nameAt(b.x)).toBe("Named B");
    expect(blank.label).toBeUndefined();
    // names next to their points
    [a, b].forEach(({ x, label }) => expect(label?.x).toBeCloseTo(x, 0));
  });

  it("keeps the y axis' labels' font size, set on their group", async () => {
    const label = async (definition: string) =>
      (await parseQuadrant(definition)).axisLabels.find(
        ({ text }) => text === "High"
      );
    const definition = `quadrantChart
  y-axis Low --> High
  A: [0.5, 0.5]`;

    // 0.875 of the font size (20)
    expect((await label(definition))?.fontSize).toBe(18);
    expect(
      (
        await label(
          `%%{init: {"quadrantChart": {"yAxisLabelFontSize": 40}}}%%\n${definition}`
        )
      )?.fontSize
    ).toBe(40);
  });

  it("draws only the names of points without a radius", async () => {
    const { elements } = graphToExcalidraw(
      await parseQuadrant(`quadrantChart
  Dot: [0.2, 0.3]
  Nothing: [0.7, 0.6] radius: 0`)
    );
    const name = elements.find(
      (element) => element.type === "text" && element.text === "Nothing"
    );

    expect(elements.filter(({ type }) => type === "ellipse").length).toBe(1);
    expect(name).toBeDefined();
    expect(name?.groupIds ?? []).toEqual([]);
  });

  describe("busy charts", () => {
    const svgSize = async (definition: string) => {
      const [, width, height] = (await renderPeleSvg(definition)).match(
        /width="([\d.]+)" height="([\d.]+)"/
      )!;
      return { width: Number(width), height: Number(height) };
    };
    const noMeasure = () => null;

    it("counts names running into names, points and quadrants' names", () => {
      const label = (text: string, x: number, y: number) => ({
        type: "text" as const,
        text,
        x,
        y,
        height: 18.75,
        fontSize: 15,
        textAlign: "center" as const,
      });
      const point = (x: number, y: number, name?: string) => ({
        x,
        y,
        radius: 5,
        label: name ? label(name, x, y + 10) : undefined,
      });
      const chart = (...points: QuadrantPoint[]): QuadrantChart => ({
        type: "quadrant",
        quadrants: [
          {
            box: { x: 0, y: 0, width: 200, height: 200 },
            label: label("Quadrant", 100, 5),
          },
        ],
        axisLabels: [],
        points,
      });

      expect(
        countOverlaps(
          chart(point(50, 100, "A"), point(150, 150, "B")),
          noMeasure
        )
      ).toBe(0);
      // names over each other
      expect(
        countOverlaps(
          chart(point(50, 100, "A"), point(55, 100, "B")),
          noMeasure
        )
      ).toBeGreaterThan(0);
      // a point over a quadrant's name
      expect(countOverlaps(chart(point(100, 15)), noMeasure)).toBe(1);
    });

    it("lays busy charts out bigger, until names don't overlap", async () => {
      const { definition } = getTestCase("quadrant-assessing-project-risks");
      const chart = await parseQuadrant(definition);

      expect((await svgSize(definition)).width).toBeGreaterThan(500);
      expect(countOverlaps(chart, noMeasure)).toBe(0);
    });

    it("keeps charts whose names don't overlap at their size", async () => {
      expect(await svgSize(getTestCase("quadrant-basic").definition)).toEqual({
        width: 500,
        height: 500,
      });
    });

    it("scales charts that set their own size, keeping the rest of their config", async () => {
      const { definition } = getTestCase(
        "quadrant-axis-positions-and-partial-labels"
      );
      const { width, height } = await svgSize(definition);
      const chart = await parseQuadrant(definition);
      const right = Math.max(
        ...chart.quadrants.map(({ box }) => box.x + box.width)
      );

      // 600x400, scaled
      expect(width / height).toBeCloseTo(1.5);
      expect(width).toBeGreaterThan(600);
      // `yAxisPosition: right`
      chart.axisLabels
        .filter(({ angle }) => angle)
        .forEach(({ x }) => expect(x).toBeGreaterThan(right));
    });
  });
});

describe("parsePele timelines", () => {
  beforeAll(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const parseTimeline = async (definition: string) => {
    const graph = await parsePele(definition);
    expect(graph.type).toBe("timeline");
    return graph as Timeline;
  };

  const contains = (outer: Box, inner: Box) =>
    inner.x >= outer.x - 0.5 &&
    inner.y >= outer.y - 0.5 &&
    inner.x + inner.width <= outer.x + outer.width + 0.5 &&
    inner.y + inner.height <= outer.y + outer.height + 0.5;

  it.each(
    testcasesOfType("timeline").map((testcase) => [testcase.id, testcase])
  )("%s", async (_, { definition }) => {
    const timeline = await parseTimeline(definition);

    expect(timeline.periods.length).toBeGreaterThan(0);
    expect(timeline.axis).toBeDefined();
    [
      ...timeline.sections,
      ...timeline.periods,
      ...timeline.periods.flatMap(({ events }) => events),
    ].forEach(({ box }) => expect(isFiniteBox(box)).toBe(true));
    expect(graphToExcalidraw(timeline).elements.length).toBeGreaterThan(0);
  });

  const TIMELINE = `timeline
    title Social media
    section Early
      2002 : LinkedIn
      2004 : Facebook : Google
    section Later
      2006 : Twitter`;

  it("reads sections, periods and their events, in order", async () => {
    const { sections, periods, title } = await parseTimeline(TIMELINE);

    expect(title?.text).toBe("Social media");
    expect(sections.map(({ label }) => label?.text)).toEqual([
      "Early",
      "Later",
    ]);
    expect(periods.map(({ label }) => label?.text)).toEqual([
      "2002",
      "2004",
      "2006",
    ]);
    expect(
      periods.map(({ events }) => events.map(({ label }) => label?.text))
    ).toEqual([["LinkedIn"], ["Facebook", "Google"], ["Twitter"]]);
    // events at 0.875 of the font size
    expect(periods[0].events[0].label?.fontSize).toBe(18);
    expect(periods[0].label?.fontSize).toBe(20);
  });

  it("lays periods out along the axis, events below them", async () => {
    const { axis, periods, sections } = await parseTimeline(TIMELINE);
    const [linkedIn, facebook] = periods;

    expect(axis!.end.x).toBeGreaterThan(axis!.start.x);
    expect(axis!.end.y).toBe(axis!.start.y);
    expect(facebook.box.x).toBeGreaterThan(linkedIn.box.x);
    periods.forEach(({ box, dot, events }) => {
      expect(box.y + box.height).toBeLessThan(axis!.start.y);
      expect(dot?.y).toBe(axis!.start.y);
      expect(dot?.x).toBeCloseTo(box.x + box.width / 2);
      events.forEach((event) =>
        expect(event.box.y).toBeGreaterThan(axis!.start.y)
      );
    });
    const [google] = facebook.events.slice(1);
    expect(google.box.y).toBeGreaterThan(facebook.events[0].box.y);
    // a section's header spans its periods, above them
    expect(sections[0].box.x).toBe(linkedIn.box.x);
    expect(sections[0].box.x + sections[0].box.width).toBe(
      facebook.box.x + facebook.box.width
    );
    expect(sections[0].box.y + sections[0].box.height).toBeLessThan(
      linkedIn.box.y
    );
  });

  it("lays periods out down the axis, events next to them, with `timeline TD`", async () => {
    const { axis, periods, direction } = await parseTimeline(
      TIMELINE.replace("timeline", "timeline TD")
    );

    expect(direction).toBe("TD");
    expect(axis!.end.y).toBeGreaterThan(axis!.start.y);
    expect(axis!.end.x).toBe(axis!.start.x);
    expect(periods[1].box.y).toBeGreaterThan(periods[0].box.y);
    periods.forEach(({ box, dot, events }) => {
      expect(box.x + box.width).toBeLessThan(axis!.start.x);
      expect(dot?.x).toBe(axis!.start.x);
      events.forEach((event) =>
        expect(event.box.x).toBeGreaterThan(axis!.start.x)
      );
    });
  });

  it("colors sections in turn, and periods outside them muted", async () => {
    const { sections, periods } = await parseTimeline(
      getTestCase("timeline-periods-outside-sections-and-without-events")
        .definition
    );

    expect(sections.map(({ color }) => color.series)).toEqual([0, 1, 2]);
    expect(periods.map(({ color }) => color.series)).toEqual([
      undefined,
      0,
      0,
      2,
      2,
    ]);
    expect(periods.find(({ label }) => label?.text === "2021")?.events).toEqual(
      []
    );
  });

  it("colors periods in turn without sections, or all alike if `disableMulticolor`", async () => {
    const colors = async (definition: string) =>
      (await parseTimeline(definition)).periods.map(
        ({ color }) => color.series
      );

    expect(await colors(getTestCase("timeline-basic").definition)).toEqual([
      0, 1, 2, 3,
    ]);
    expect(
      await colors(getTestCase("timeline-single-color").definition)
    ).toEqual([0, 0, 0]);
  });

  it("reads colors set by `cScale` theme variables", async () => {
    const timeline = await parseTimeline(
      getTestCase("timeline-custom-colors").definition
    );
    const { periods } = timeline;
    const { elements } = graphToExcalidraw(timeline);
    const box = (text: string) =>
      elements.find(
        (element) =>
          element.type === "rectangle" && element.label?.text === text
      )!;

    expect(periods.map(({ color }) => color)).toEqual([
      // white text on dark blue, as Pele picks it
      { series: 0, fill: "#1864ab", text: "#fff" },
      { series: 1, fill: "#ffe066", text: "#1f1f1f" },
      { series: 2, fill: "rebeccapurple", text: "#fff" },
      // not themed
      { series: 3 },
    ]);
    expect(box("2002")).toMatchObject({
      backgroundColor: "#1864ab",
      label: { strokeColor: "#fff" },
    });
    // events as Pele draws them, at 16% opacity, over white
    expect(box("LinkedIn")).toMatchObject({
      backgroundColor: "#dae6f2",
      strokeColor: "#1864ab",
      label: { strokeColor: "#1e1e1e" },
    });
    // (named colors, without a canvas to read them with, aren't lightened)
    expect(box("YouTube").backgroundColor).toBe("#ffffff");
    expect(box("2006").backgroundColor).toBe("#ffc9c9");
  });

  it.each([
    ["hex", "'#663399'"],
    ["rgb()", "'rgb(102, 51, 153)'"],
    ["rgb() with spaces", "'rgb(102 51 153 / 100%)'"],
    ["hsl()", "'hsl(270 50% 40%)'"],
    ["hsla()", "'hsla(270deg, 50%, 40%, 1)'"],
  ])("lightens a themed %s color for events alike", async (_, color) => {
    const { elements } = graphToExcalidraw(
      await parseTimeline(`%%{init: {'themeVariables': {'cScale0': ${color}}}}%%
timeline
    2002 : LinkedIn`)
    );
    const event = elements.find(
      (element) =>
        element.type === "rectangle" && element.label?.text === "LinkedIn"
    );

    expect(event?.backgroundColor).toBe("#e7deef");
  });

  it("converts boxes with bound names, grouping each period with its events", async () => {
    const timeline = await parseTimeline(TIMELINE);
    const { elements } = graphToExcalidraw(timeline);
    const box = (text: string) =>
      elements.find(
        (element) =>
          element.type === "rectangle" && element.label?.text === text
      )!;
    const [axis, ...links] = elements.filter(({ type }) => type === "arrow");
    const dots = elements.filter(({ type }) => type === "ellipse");
    const linked = (link: (typeof links)[number]) =>
      [link.start, link.end].map(
        (end) =>
          elements.find(
            (element) => element.id === (end as { id?: string } | undefined)?.id
          )?.label?.text
      );

    expect(axis).toMatchObject({ endArrowhead: "triangle" });
    // the axis is drawn behind everything else
    expect(elements.indexOf(axis)).toBe(0);
    expect(dots.length).toBe(3);
    // nothing grouped
    elements.forEach((element) => expect(element.groupIds ?? []).toEqual([]));
    // a period's events, connected down from it, one to the next
    expect(links.map(linked)).toEqual([
      ["2002", "LinkedIn"],
      ["2004", "Facebook"],
      ["Facebook", "Google"],
      ["2006", "Twitter"],
    ]);
    links.forEach((link) =>
      expect(link).toMatchObject({
        elbowed: true,
        startArrowhead: null,
        endArrowhead: null,
      })
    );
    expect(box("2002").label).toMatchObject({
      textAlign: "center",
      verticalAlign: "middle",
      fontSize: 20,
    });
    // Excalidraw's colors for Pele's: blue, then orange
    expect(box("2002")).toMatchObject({
      backgroundColor: "#a5d8ff",
      strokeColor: "#1971c2",
    });
    expect(box("Early").backgroundColor).toBe("#4dabf7");
    expect(box("LinkedIn").backgroundColor).toBe("#e7f5ff");
    expect(box("Later").backgroundColor).toBe("#ffa94d");
    // events stay within the chart (e.g. not growing out of their boxes)
    const [linkedIn] = timeline.periods[0].events;
    expect(contains(box("LinkedIn") as Box, linkedIn.box)).toBe(true);
  });

  it("connects each event to its period along a bracket, with `timeline TD`", async () => {
    const { elements } = graphToExcalidraw(
      await parseTimeline(TIMELINE.replace("timeline", "timeline TD"))
    );
    const id = (text: string) =>
      elements.find(
        (element) =>
          element.type === "rectangle" && element.label?.text === text
      )?.id;
    const linksFrom = (text: string) =>
      elements.filter(
        (element) =>
          element.type === "arrow" &&
          (element.start as { id?: string } | undefined)?.id === id(text)
      );
    const [toFacebook, toGoogle] = linksFrom("2004");

    expect(linksFrom("2004").length).toBe(2);
    expect(toFacebook.end).toEqual({ id: id("Facebook") });
    expect(toGoogle.end).toEqual({ id: id("Google") });
    // across to the first event, level with the period; down to the next
    expect(toFacebook.points?.length).toBe(2);
    expect(toGoogle.points?.length).toBe(4);
    expect(toGoogle).toMatchObject({ elbowed: true, fixedSegments: [{}] });
  });

  it("connects periods without events to their dot on the axis", async () => {
    const { elements } = graphToExcalidraw(
      await parseTimeline(
        getTestCase("timeline-periods-outside-sections-and-without-events")
          .definition
      )
    );
    const period = elements.find(
      (element) =>
        element.type === "rectangle" && element.label?.text === "2021"
    );
    const [link] = elements.filter(
      (element) =>
        element.type === "arrow" &&
        (element.start as { id?: string } | undefined)?.id === period?.id
    );
    const end = elements.find(
      (element) => element.id === (link?.end as { id?: string })?.id
    );

    expect(end?.type).toBe("ellipse");
  });

  it("keeps line breaks and wrapped lines in names", async () => {
    const { periods } = await parseTimeline(`timeline
    A long period name that wraps : First line<br>second line`);

    expect(periods[0].label?.text.split("\n").length).toBeGreaterThan(1);
    expect(periods[0].events[0].label?.text).toBe("First line\nsecond line");
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

  it("labels a double circle once, in its inner circle", async () => {
    const elements = await convert("flowchart TD\n  id1(((Label)))");
    const labeled = elements.filter(
      (element) => element.label?.text === "Label"
    );
    expect(labeled).toHaveLength(1);
    // above the outer one, which is filled
    expect(elements.indexOf(labeled[0])).toBeGreaterThan(
      elements.findIndex((element) => element.id === "id1")
    );
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

  it("keeps namespaces' ids apart from their classes'", async () => {
    const elements = await convert(`classDiagram
  namespace Foo {
    class Foo__namespace
    class Foo__namespace_title
  }
  X --> Foo__namespace`);
    const ids = elements.map(({ id }) => id).filter(Boolean);

    expect(new Set(ids).size).toBe(ids.length);
    // the relation still binds to the class
    const arrow = elements.find((element) => element.type === "arrow");
    const end = elements.find((element) => element.id === arrow.end.id);
    expect(end.label?.text).toBe("Foo__namespace");
    expect(
      elements.filter(
        (element) =>
          element.type === "rectangle" &&
          element.backgroundColor === NODE_BACKGROUND_COLOR &&
          element.strokeColor === "transparent"
      )
    ).toEqual([
      expect.objectContaining({
        label: expect.objectContaining({ text: "Foo" }),
      }),
    ]);
  });

  it("reads namespaces' titles Pele draws apart from their boxes", async () => {
    // Pele draws this title in its own group, above the relations
    const diagram = (await parsePele(`classDiagram
  namespace Foo["Group of things"] {
    class A
    class B
    class C
  }
  X --> A
  Y --> B
  Z --> C`)) as Class;
    const [namespace] = diagram.namespaces;

    expect(namespace).toMatchObject({ id: "Foo", text: "Group of things" });
    // where Pele drew it, on the left
    expect(namespace.titleX).toBeLessThan(namespace.x + namespace.width / 2);
  });

  it("draws namespaces like subgraphs, around their classes only", async () => {
    const elements = await convert(
      getTestCase("class-namespaces-with-relations").definition
    );
    const byId = (id: string) => elements.find((element) => element.id === id);
    const contains = (outer: any, inner: any) =>
      outer.x <= inner.x &&
      outer.y <= inner.y &&
      outer.x + outer.width >= inner.x + inner.width &&
      outer.y + outer.height >= inner.y + inner.height;

    expect(elements.some((element) => element.type === "frame")).toBe(false);
    const shapes = byId("Shapes__namespace");
    const drawing = byId("Drawing__namespace");
    // the namespaces' boxes behind the relations, their titles above them
    [shapes, drawing].forEach((namespace) => {
      expect(namespace).toMatchObject({ type: "rectangle" });
      expect(namespace.label).toBeUndefined();
      expect(namespace.groupIds ?? []).toEqual([]);
      expect(elements.indexOf(namespace)).toBeLessThan(firstArrow(elements));
    });
    ["Shapes", "Drawing"].forEach((id) => {
      const title = byId(`${id}__namespace_title`);
      expect(title).toMatchObject({
        label: { text: id },
        backgroundColor: NODE_BACKGROUND_COLOR,
        strokeColor: "transparent",
      });
      expect(elements.indexOf(title)).toBeGreaterThan(lastArrow(elements));
      expect(contains(byId(`${id}__namespace`), title)).toBe(true);
    });

    // where Pele drew it, on the left, clear of the relation entering from
    // above, in the middle
    const draws = elements.find(
      (element) => element.type === "arrow" && element.label?.text === "draws"
    );
    const shapesTitle = byId("Shapes__namespace_title");
    expect(shapesTitle.x).toBeGreaterThan(shapes.x);
    expect(shapesTitle.x + shapesTitle.width / 2).toBeLessThan(draws.x);

    expect(contains(shapes, byId("Shape"))).toBe(true);
    expect(contains(shapes, byId("Circle"))).toBe(true);
    expect(contains(shapes, byId("Canvas"))).toBe(false);
    expect(contains(drawing, byId("Canvas"))).toBe(true);
    expect(contains(drawing, byId("Shape"))).toBe(false);

    // relations bind to their classes, not to the namespaces
    const arrows = elements.filter((element) => element.type === "arrow");
    expect(arrows).toHaveLength(2);
    expect(
      arrows.map(({ start, end }) => [start?.id, end?.id]).flat()
    ).not.toEqual(expect.arrayContaining([expect.stringMatching(/namespace/)]));
  });
});

describe("the elbow option", () => {
  const FLOWCHART = `flowchart LR
  A --> B --> C`;
  const STATE = `stateDiagram-v2
  [*] --> Ready
  Ready --> Busy
  Busy --> Ready`;

  // Whether all edges are drawn as elbow arrows (or none)
  const getElbowed = async (definition: string, config: MermaidConfig) => {
    const graph = (await parseDiagram(definition, config)) as Flowchart | State;
    expect(graph.edges.length).toBeGreaterThan(1);
    const elbowed = graph.edges.map(({ orthogonal }) => !!orthogonal);
    expect(new Set(elbowed).size).toBe(1);
    return elbowed[0];
  };

  it("draws flowcharts' edges and state transitions as elbow arrows", async () => {
    expect(await getElbowed(FLOWCHART, { elbow: true })).toBe(true);
    expect(await getElbowed(STATE, { elbow: true })).toBe(true);
    expect(await getElbowed(FLOWCHART, {})).toBe(false);
    expect(await getElbowed(STATE, {})).toBe(false);
  });

  it("sets them per diagram type", async () => {
    const flowchartOnly = { elbow: { flowchart: true } };
    expect(await getElbowed(FLOWCHART, flowchartOnly)).toBe(true);
    expect(await getElbowed(STATE, flowchartOnly)).toBe(false);

    const stateOnly = { elbow: { state: true } };
    expect(await getElbowed(FLOWCHART, stateOnly)).toBe(false);
    expect(await getElbowed(STATE, stateOnly)).toBe(true);
  });

  it("gives way to a curve set in the definition", async () => {
    const steppedState = `%%{init: {"flowchart": {"curve": "step"}}}%%\n${STATE}`;
    expect(await getElbowed(steppedState, { elbow: false })).toBe(true);
    const curvedFlowchart = `---
config:
  flowchart:
    curve: basis
---
${FLOWCHART}`;
    expect(await getElbowed(curvedFlowchart, { elbow: true })).toBe(false);
  });
});
