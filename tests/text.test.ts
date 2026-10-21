import {
  decodeMermaidText,
  getTextContentWithLineBreaks,
  normalizeText,
  replaceEscapedNewlines,
} from "../src/text.js";

describe("normalizeText", () => {
  it("normalizes Mermaid break tags and unescaped slash-n sequences", () => {
    expect(normalizeText("Line 1\\nLine 2")).toBe("Line 1\nLine 2");
    expect(normalizeText("Line 1<br>Line 2")).toBe("Line 1\nLine 2");
    expect(normalizeText("Line 1<br/>Line 2")).toBe("Line 1\nLine 2");
    expect(normalizeText("Line 1<br />Line 2")).toBe("Line 1\nLine 2");
    expect(normalizeText("Line 1<BR>Line 2")).toBe("Line 1\nLine 2");
  });

  it("preserves escaped slash-n sequences", () => {
    expect(normalizeText("Line 1\\\\nLine 2")).toBe("Line 1\\nLine 2");
    expect(normalizeText("Line 1\\\\\\nLine 2")).toBe("Line 1\\\nLine 2");
  });

  it("distinguishes break elements from escaped break text", () => {
    expect(decodeMermaidText("one&lt;br&gt;two")).toBe("one<br>two");
    expect(decodeMermaidText("one#60;br#62;two")).toBe("one<br>two");

    const element = document.createElement("div");
    element.innerHTML = "one<br>two &lt;br&gt; three";
    expect(getTextContentWithLineBreaks(element)).toBe("one\ntwo <br> three");
  });
});

describe("replaceEscapedNewlines", () => {
  it("replaces odd slash runs and halves escaped slashes", () => {
    expect(replaceEscapedNewlines("a\\nb", "<br/>")).toBe("a<br/>b");
    expect(replaceEscapedNewlines("a\\\\nb", "<br/>")).toBe("a\\nb");
    expect(replaceEscapedNewlines("a\\\\\\nb", "<br/>")).toBe("a\\<br/>b");
    expect(replaceEscapedNewlines("a<br>b", "\n")).toBe("a<br>b");
  });
});
