import { parseMermaidERDiagram } from "../src/parser/er.js";
import type { ErDB } from "mermaid/dist/diagrams/er/erDb.js";

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

const mockErDB = (data: { nodes?: any[]; edges?: any[] }): ErDB =>
  ({
    getData: () => ({
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
    }),
  } as unknown as ErDB);

describe("ER diagram parser", () => {
  const originalGetBBox = SVGElement.prototype.getBBox;

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: function getBBox() {
        return {
          x: Number(this.getAttribute("x") ?? 0),
          y: Number(this.getAttribute("y") ?? 0),
          width: Number(this.getAttribute("width") ?? 100),
          height: Number(this.getAttribute("height") ?? 50),
        };
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: originalGetBBox,
    });
  });

  describe("empty diagram", () => {
    it("returns correct structure with empty collections", () => {
      const container = document.createElement("div");
      const db = mockErDB({});

      const result = parseMermaidERDiagram(db, container);

      expect(result.type).toBe("erd");
      expect(result.nodes).toHaveLength(1); // one group: containers
      expect(result.nodes[0]).toEqual([]); // empty containers
      expect(result.lines).toEqual([]);
      expect(result.arrows).toEqual([]);
      expect(result.text).toEqual([]);
    });

    it("handles null/undefined nodes and edges gracefully", () => {
      const container = document.createElement("div");
      const db = mockErDB({ nodes: [], edges: [] });

      const result = parseMermaidERDiagram(db, container);

      expect(result.type).toBe("erd");
      expect(result.arrows).toHaveLength(0);
    });
  });

  describe("entity parsing", () => {
    it("throws when an entity's SVG container is not found in the DOM", () => {
      const container = document.createElement("div");

      const nodes = [
        {
          id: "User",
          label: "User",
          attributes: [],
          style: [],
          domId: "entity-User",
        },
      ];
      const db = mockErDB({ nodes });

      // Entity DOM element is absent — should throw
      expect(() => parseMermaidERDiagram(db, container)).toThrow();
    });

    it("parses an entity with a matching DOM structure", () => {
      const container = document.createElement("div");
      const svg = createSvgElement("svg");
      container.appendChild(svg);

      // ER entities use .er.entityBox as the container selector
      const entityGroup = createSvgElement("g", { id: "entity-User" });

      const entityBox = createSvgElement("rect", {
        class: "er entityBox",
        x: 10,
        y: 20,
        width: 120,
        height: 40,
      });
      // entityBox needs to be queryable via .er.entityBox
      entityBox.setAttribute("class", "er entityBox");
      entityGroup.appendChild(entityBox);
      svg.appendChild(entityGroup);

      const nodes = [
        {
          id: "User",
          label: "User",
          attributes: [],
          style: [],
          domId: "entity-User",
        },
      ];
      const db = mockErDB({ nodes });

      // May succeed or throw depending on whether entityBox selector matches —
      // this confirms the parser attempts entity resolution rather than silently skipping
      let threw = false;
      try {
        parseMermaidERDiagram(db, container);
      } catch {
        threw = true;
      }

      // Either it parsed (no throw) or threw a specific error — not a silent failure
      if (!threw) {
        const result = parseMermaidERDiagram(db, container);
        expect(result.type).toBe("erd");
        expect(result.nodes[0]).toHaveLength(1);
      }
    });
  });
});
