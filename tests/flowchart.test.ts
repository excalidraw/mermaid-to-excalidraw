import { parseMermaidFlowChartDiagram } from "../src/parser/flowchart.js";
import type { FlowDB } from "mermaid/dist/diagrams/flowchart/flowDb.js";

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

const mockFlowDB = (overrides: Partial<{
  vertices: any;
  edges: any;
  subGraphs: any;
  classes: any;
}>): FlowDB => ({
  getVertices: () => overrides.vertices ?? new Map(),
  getEdges: () => overrides.edges ?? [],
  getSubGraphs: () => overrides.subGraphs ?? [],
  getClasses: () => overrides.classes ?? new Map(),
} as unknown as FlowDB);

describe("Flowchart parser", () => {
  const originalGetBBox = SVGElement.prototype.getBBox;

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: function getBBox() {
        return {
          x: Number(this.getAttribute("data-x") ?? 0),
          y: Number(this.getAttribute("data-y") ?? 0),
          width: Number(this.getAttribute("data-width") ?? 100),
          height: Number(this.getAttribute("data-height") ?? 50),
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
      const db = mockFlowDB({});

      const result = parseMermaidFlowChartDiagram(db, container);

      expect(result.type).toBe("flowchart");
      expect(result.vertices).toEqual({});
      expect(result.edges).toEqual([]);
      expect(result.subGraphs).toEqual([]);
    });

    it("handles object-based vertices (non-Map fallback)", () => {
      const container = document.createElement("div");
      const db = mockFlowDB({ vertices: {} });

      const result = parseMermaidFlowChartDiagram(db, container);

      expect(result.type).toBe("flowchart");
      expect(result.vertices).toEqual({});
    });
  });

  describe("vertex parsing", () => {
    it("returns undefined for a vertex whose DOM element is missing", () => {
      const container = document.createElement("div");

      const vertices = new Map([
        [
          "A",
          {
            id: "A",
            domId: "flowchart-A-1",
            text: "Hello",
            labelType: "string",
            type: "square",
            styles: [],
            classes: [],
          },
        ],
      ]);
      const db = mockFlowDB({ vertices });

      const result = parseMermaidFlowChartDiagram(db, container);

      // No element with id containing "flowchart-A-1" in container → undefined
      expect(result.vertices["A"]).toBeUndefined();
    });

    it("decodes entity codes in vertex text", () => {
      const container = document.createElement("div");
      const svg = createSvgElement("svg");
      container.appendChild(svg);

      // Vertex node identified by domId
      const vertexEl = createSvgElement("g", { id: "flowchart-A-1" });
      // Child element needed by computeElementPosition
      const childEl = createSvgElement("g");
      vertexEl.appendChild(childEl);
      svg.appendChild(vertexEl);

      const vertices = new Map([
        [
          "A",
          {
            id: "A",
            domId: "flowchart-A-1",
            text: "#9829;", // entity code for ♥
            labelType: "string",
            type: "square",
            styles: [],
            classes: [],
          },
        ],
      ]);
      const db = mockFlowDB({ vertices });

      const result = parseMermaidFlowChartDiagram(db, container);

      expect(result.vertices["A"]?.text).toBe("♥");
    });

    it("returns vertex with correct id and labelType", () => {
      const container = document.createElement("div");
      const svg = createSvgElement("svg");
      container.appendChild(svg);

      const vertexEl = createSvgElement("g", { id: "flowchart-C-1" });
      vertexEl.appendChild(createSvgElement("g"));
      svg.appendChild(vertexEl);

      const vertices = new Map([
        [
          "C",
          {
            id: "C",
            domId: "flowchart-C-1",
            text: "Node C",
            labelType: "string",
            type: "square",
            styles: [],
            classes: [],
          },
        ],
      ]);
      const db = mockFlowDB({ vertices });

      const result = parseMermaidFlowChartDiagram(db, container);

      expect(result.vertices["C"]?.id).toBe("C");
      expect(result.vertices["C"]?.labelType).toBe("string");
    });
  });

  describe("edge parsing", () => {
    it("filters out edges whose DOM elements are missing", () => {
      const container = document.createElement("div");

      const edges = [
        {
          id: "L-A-B-0",
          start: "A",
          end: "B",
          text: "label",
          labelType: "string",
          type: "arrow",
          stroke: "normal",
        },
      ];
      const db = mockFlowDB({ edges });

      const result = parseMermaidFlowChartDiagram(db, container);

      // No element with id containing "L-A-B-0" → edge is filtered out
      expect(result.edges).toHaveLength(0);
    });

    it("includes edges whose DOM path elements are present", () => {
      const container = document.createElement("div");
      const svg = createSvgElement("svg", { id: "container" });
      container.appendChild(svg);

      const edgeEl = createSvgElement("path", {
        id: "L-A-B-0",
        d: "M10,20L50,20L90,20",
      });
      svg.appendChild(edgeEl);

      const edges = [
        {
          id: "L-A-B-0",
          start: "A",
          end: "B",
          text: "hello",
          labelType: "string",
          type: "arrow",
          stroke: "normal",
        },
      ];
      const db = mockFlowDB({ edges });

      const result = parseMermaidFlowChartDiagram(db, container);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].start).toBe("A");
      expect(result.edges[0].end).toBe("B");
    });

    it("decodes entity codes in edge labels", () => {
      const container = document.createElement("div");
      const svg = createSvgElement("svg");
      container.appendChild(svg);

      const edgeEl = createSvgElement("path", {
        id: "L-A-B-0",
        d: "M10,20L50,20L90,20",
      });
      svg.appendChild(edgeEl);

      const edges = [
        {
          id: "L-A-B-0",
          start: "A",
          end: "B",
          text: "#9829;",
          labelType: "string",
          type: "arrow",
          stroke: "normal",
        },
      ];
      const db = mockFlowDB({ edges });

      const result = parseMermaidFlowChartDiagram(db, container);

      expect(result.edges[0].text).toBe("♥");
    });
  });
});
