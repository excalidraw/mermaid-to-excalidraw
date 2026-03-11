import {
  cleanCSSStyles,
  isValidCSSColor,
  parseCSSDeclarations,
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
});
