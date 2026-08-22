import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parseMermaid } from "../src/parseMermaid.js";

/**
 * Regression for https://github.com/excalidraw/mermaid-to-excalidraw/issues/108
 *
 * Class and ER diagrams must parse to Excalidraw vector elements. When Mermaid
 * drifts past 11.12.1 (allowed by `^11.12.1`), SVG node ids become prefixed with
 * the render id and these parsers fall back to a single graphImage/SVG.
 */
describe("issue #108: Class and ER must not fall back to SVG", () => {
  const originalGetBBox = SVGElement.prototype.getBBox;
  const originalGetBoundingClientRect =
    SVGElement.prototype.getBoundingClientRect;
  const originalGetComputedTextLength =
    SVGElement.prototype.getComputedTextLength;

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: function getBBox() {
        const tag = this.tagName.toLowerCase();
        const num = (key: string, fallback = 0) =>
          Number(this.getAttribute(key) ?? fallback);
        const text = this.textContent ?? "";

        if (tag === "rect" || tag === "foreignobject" || tag === "image") {
          return {
            x: num("x"),
            y: num("y"),
            width: num("width") || Math.max(text.length * 8, 40),
            height: num("height") || 20,
          };
        }

        if (tag === "text" || tag === "tspan") {
          return {
            x: num("x"),
            y: num("y"),
            width: Math.max(text.length * 8, 1),
            height: 16,
          };
        }

        return { x: 0, y: 0, width: 100, height: 20 };
      },
    });

    Object.defineProperty(SVGElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: function getBoundingClientRect() {
        const box = (this as SVGGraphicsElement).getBBox();
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

  it("parses a minimal class diagram into class elements, not an image", async () => {
    const graph = await parseMermaid(`classDiagram
  class Duck`);

    expect(graph.type).toBe("class");

    const { elements } = graphToExcalidraw(graph);
    const types = elements.map((element) => element.type);

    expect(types).not.toContain("image");
    expect(types).toContain("rectangle");
  });

  it("parses a minimal ER diagram into erd elements, not an image", async () => {
    const graph = await parseMermaid(`erDiagram
  PERSON {
    string name
  }`);

    expect(graph.type).toBe("erd");

    const { elements } = graphToExcalidraw(graph);
    const types = elements.map((element) => element.type);

    expect(types).not.toContain("image");
    expect(types).toContain("rectangle");
  });
});
