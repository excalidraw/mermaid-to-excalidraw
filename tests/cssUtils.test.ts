import {
  isValidCSSColor,
  parseCSSColor,
  parseCSSDeclarations,
} from "../src/cssUtils.js";

describe("cssUtils", () => {
  it("splits whitespace-delimited declarations from Mermaid classDef styles", () => {
    expect(parseCSSDeclarations("stroke:#00f stroke-width:2px")).toEqual([
      { property: "stroke", value: "#00f" },
      { property: "stroke-width", value: "2px" },
    ]);
  });

  it("preserves commas and spaces inside CSS values", () => {
    expect(
      parseCSSDeclarations(
        "fill:rgb(191, 223, 255),stroke:#333,stroke-dasharray: 10 5"
      )
    ).toEqual([
      { property: "fill", value: "rgb(191, 223, 255)" },
      { property: "stroke", value: "#333" },
      { property: "stroke-dasharray", value: "10 5" },
    ]);
  });

  it("detects malformed CSS colors", () => {
    expect(isValidCSSColor("#00f")).toBe(true);
    expect(isValidCSSColor("rgb(191, 223, 255)")).toBe(true);
    expect(isValidCSSColor("#00f stroke-width:2px")).toBe(false);
  });

  describe("parseCSSColor", () => {
    const PURPLE = { r: 102, g: 51, b: 153, a: 1 };
    const close = ({ r, g, b, a }: typeof PURPLE) => ({
      r: expect.closeTo(r, 5),
      g: expect.closeTo(g, 5),
      b: expect.closeTo(b, 5),
      a: expect.closeTo(a, 5),
    });

    it.each([
      "#663399",
      "#639",
      "#663399ff",
      "rgb(102, 51, 153)",
      "rgba(102, 51, 153, 1)",
      "rgb(102 51 153 / 100%)",
      "rgb(40% 20% 60%)",
      "hsl(270, 50%, 40%)",
      "hsl(270deg 50% 40%)",
      "hsl(0.75turn 50% 40%)",
      "hsla(270, 50%, 40%, 1)",
    ])("reads %s", (color) => {
      expect(parseCSSColor(color)).toEqual(close(PURPLE));
    });

    it("reads alpha", () => {
      expect(parseCSSColor("#66339980")?.a).toBeCloseTo(128 / 255);
      expect(parseCSSColor("rgb(102 51 153 / 50%)")?.a).toBe(0.5);
      expect(parseCSSColor("hsla(270, 50%, 40%, 0.25)")?.a).toBe(0.25);
    });

    it("reads hsl() hues around the color wheel", () => {
      expect(parseCSSColor("hsl(0 100% 50%)")).toEqual(
        close({ r: 255, g: 0, b: 0, a: 1 })
      );
      expect(parseCSSColor("hsl(120 100% 50%)")).toEqual(
        close({ r: 0, g: 255, b: 0, a: 1 })
      );
      expect(parseCSSColor("hsl(-120 100% 50%)")).toEqual(
        close({ r: 0, g: 0, b: 255, a: 1 })
      );
    });

    it("rejects what isn't a color", () => {
      expect(parseCSSColor("rgb(1, 2)")).toBeUndefined();
      expect(parseCSSColor("#12345")).toBeUndefined();
      expect(parseCSSColor("not-a-color")).toBeUndefined();
    });

    it("reads other colors (e.g. named ones) as a canvas normalizes them", () => {
      const context = {
        value: "#000000",
        get fillStyle() {
          return this.value;
        },
        set fillStyle(color: string) {
          // (as browsers do, ignoring invalid colors)
          const normalized = { rebeccapurple: "#663399", "#000000": "#000000" }[
            color
          ];
          if (normalized) {
            this.value = normalized;
          }
        },
      };
      const spy = vi
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockReturnValue(context as unknown as CanvasRenderingContext2D);
      try {
        expect(parseCSSColor("rebeccapurple")).toEqual(close(PURPLE));
      } finally {
        spy.mockRestore();
      }
    });
  });
});
