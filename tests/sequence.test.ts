import type { Diagram } from "mermaid/dist/Diagram.js";
import { parseMermaidSequenceDiagram } from "../src/parser/sequence.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const createSvgElement = (
  tagName: string,
  attrs: Record<string, string | number> = {}
) => {
  const el = document.createElementNS(SVG_NS, tagName);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, String(value));
  });
  return el;
};

describe("Sequence parser", () => {
  const originalGetBBox = SVGElement.prototype.getBBox;

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: function getBBox() {
        const tag = this.tagName.toLowerCase();
        const num = (key: string, fallback = 0) =>
          Number(this.getAttribute(key) ?? fallback);

        if (tag === "rect") {
          return {
            x: num("x"),
            y: num("y"),
            width: num("width"),
            height: num("height"),
          };
        }

        if (tag === "circle") {
          const r = num("r");
          const cx = num("cx");
          const cy = num("cy");
          return {
            x: cx - r,
            y: cy - r,
            width: r * 2,
            height: r * 2,
          };
        }

        if (tag === "text") {
          const text = this.textContent ?? "";
          return {
            x: num("x"),
            y: num("y"),
            width: Math.max(text.length * 8, 1),
            height: 16,
          };
        }

        return { x: 0, y: 0, width: 0, height: 0 };
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: originalGetBBox,
    });
  });

  it("parses actor lifelines when actor lines are wrapped in groups", () => {
    const container = document.createElement("div");
    const svg = createSvgElement("svg");
    container.appendChild(svg);

    const actorNames = [
      { name: "Alice", x: 120 },
      { name: "Bob", x: 300 },
    ];

    actorNames.forEach(({ name, x }) => {
      const lineGroup = createSvgElement("g");
      lineGroup.appendChild(
        createSvgElement("line", {
          class: "actor-line 200",
          name,
          x1: x,
          y1: 80,
          x2: x,
          y2: 280,
        })
      );
      svg.appendChild(lineGroup);

      const actorTop = createSvgElement("g", {
        class: "actor-man actor-top",
        name,
      });
      actorTop.appendChild(createSvgElement("circle", { cx: x, cy: 30, r: 12 }));
      svg.appendChild(actorTop);

      const actorBottom = createSvgElement("g", {
        class: "actor-man actor-bottom",
        name,
      });
      actorBottom.appendChild(
        createSvgElement("circle", { cx: x, cy: 320, r: 12 })
      );
      svg.appendChild(actorBottom);
    });

    svg.appendChild(
      createSvgElement("line", {
        class: "messageLine0",
        x1: 120,
        y1: 140,
        x2: 300,
        y2: 140,
      })
    );
    svg.appendChild(
      createSvgElement("line", {
        class: "messageLine0",
        x1: 300,
        y1: 180,
        x2: 120,
        y2: 180,
      })
    );

    const actorData = new Map([
      [
        "Alice",
        { name: "Alice", description: "Alice", type: "actor" as const },
      ],
      ["Bob", { name: "Bob", description: "Bob", type: "actor" as const }],
    ]);
    const messages = [
      { type: 0, from: "Alice", to: "Bob", message: "Hi Bob", wrap: true },
      { type: 0, from: "Bob", to: "Alice", message: "Hi Alice", wrap: true },
    ];

    const diagram = {
      text: `sequenceDiagram
  actor Alice
  actor Bob
  Alice->>Bob: Hi Bob
  Bob->>Alice: Hi Alice`,
      parser: {
        parse: vi.fn(),
        yy: {
          getBoxes: () => [],
          getActors: () => actorData,
          getMessages: () => messages,
        },
      },
    } as unknown as Diagram;

    const result = parseMermaidSequenceDiagram(diagram, container);

    expect(result.type).toBe("sequence");
    expect(result.lines).toHaveLength(2);
    expect(result.arrows).toHaveLength(2);
    expect(result.arrows[0].start?.type).toBe("ellipse");
    expect(result.arrows[0].end?.type).toBe("ellipse");
    expect(result.arrows[0].start?.id).toBe("Alice-top-0");
    expect(result.arrows[0].end?.id).toBe("Bob-top-0");
  });
});
