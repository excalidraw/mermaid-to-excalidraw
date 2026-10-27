import {
  decodeMermaidText,
  normalizeText,
  replaceEscapedNewlines,
  withLineBreakFallback,
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
  });
});

describe("decodeMermaidText", () => {
  it("keeps the content of inline HTML tags, but not the tags", () => {
    expect(decodeMermaidText("Entity 6<br><sub>Entity6</sub>")).toBe(
      "Entity 6\nEntity6"
    );
    expect(
      decodeMermaidText('<b>bold</b> <span style="color:red">red</span>')
    ).toBe("bold red");
  });

  it("keeps escaped tags and comparisons as text", () => {
    expect(decodeMermaidText("&lt;sub&gt;x&lt;/sub&gt;")).toBe("<sub>x</sub>");
    expect(decodeMermaidText("#lt;b#gt;")).toBe("<b>");
    expect(decodeMermaidText("a < b and c > d")).toBe("a < b and c > d");
    expect(decodeMermaidText("List<String>")).toBe("List<String>");
    expect(decodeMermaidText("Map<A, B>")).toBe("Map<A, B>");
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

describe("withLineBreakFallback", () => {
  it("runs the task once when it succeeds", async () => {
    const task = vi.fn(async (definition: string) => definition);

    await expect(withLineBreakFallback("A<br>B", task)).resolves.toBe("A<br>B");
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("retries with \\n when the definition with <br> fails", async () => {
    const task = vi.fn(async (definition: string) => {
      if (definition.includes("<br")) {
        throw new Error("parse error");
      }
      return definition;
    });

    await expect(withLineBreakFallback("A<br>B<BR />C", task)).resolves.toBe(
      "A\\nB\\nC"
    );
    expect(task).toHaveBeenCalledTimes(2);
  });

  it("throws the original error without retrying when there's no <br>", async () => {
    const task = vi.fn(async () => {
      throw new Error("original");
    });

    await expect(withLineBreakFallback("A\\nB", task)).rejects.toThrow(
      "original"
    );
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("throws the original error when the retry fails too", async () => {
    const task = vi.fn(async (definition: string) => {
      throw new Error(definition.includes("<br") ? "original" : "retry");
    });

    await expect(withLineBreakFallback("A<br>B", task)).rejects.toThrow(
      "original"
    );
    expect(task).toHaveBeenCalledTimes(2);
  });
});
