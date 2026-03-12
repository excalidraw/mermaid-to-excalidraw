import {
  cleanCSSStyles,
  isValidCSSColor,
  parseCSSDeclarations,
  resolveElementTextColor,
} from "../src/parser/cssUtils.js";

describe("cssUtils", () => {
  it("splits whitespace-delimited declarations from Mermaid classDef styles", () => {
    expect(parseCSSDeclarations("stroke:#00f stroke-width:2px")).toEqual([
      { property: "stroke", value: "#00f" },
      { property: "stroke-width", value: "2px" },
    ]);
  });

  it("preserves commas and spaces inside CSS values", () => {
    expect(
      cleanCSSStyles([
        "fill:rgb(191, 223, 255),stroke:#333,stroke-dasharray: 10 5",
      ])
    ).toEqual([
      "fill:rgb(191, 223, 255)",
      "stroke:#333",
      "stroke-dasharray:10 5",
    ]);
  });

  it("detects malformed CSS colors", () => {
    expect(isValidCSSColor("#00f")).toBe(true);
    expect(isValidCSSColor("rgb(191, 223, 255)")).toBe(true);
    expect(isValidCSSColor("#00f stroke-width:2px")).toBe(false);
  });

  it("prefers an explicit fallback text color over default computed colors", () => {
    const textNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );

    expect(resolveElementTextColor(textNode, "#01579b")).toBe("#01579b");
  });

  it("prefers an explicit text fill over a fallback color", () => {
    const textNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textNode.setAttribute("fill", "#e65100");

    expect(resolveElementTextColor(textNode, "#01579b")).toBe("#e65100");
  });
});
