import mermaid from "mermaid";

import {
  withLineBreakFallback,
  withMermaidLineBreaks,
} from "../src/mermaidLineBreaks.js";

// `mermaidAPI` is frozen: use a copy whose `getDiagramFromText` is observable.
vi.mock("mermaid", async (importOriginal) => {
  const actual = ((await importOriginal()) as any).default;
  return {
    default: {
      ...actual,
      mermaidAPI: {
        ...actual.mermaidAPI,
        getDiagramFromText: vi.fn(actual.mermaidAPI.getDiagramFromText),
      },
    },
  };
});

const getDiagramFromText = vi.mocked(mermaid.mermaidAPI.getDiagramFromText);

const noopRender = async () => undefined;

describe("withMermaidLineBreaks", () => {
  beforeAll(() => {
    mermaid.initialize({ startOnLoad: false });
  });

  afterEach(() => {
    getDiagramFromText.mockClear();
  });

  it("installs hooks only for the rendered diagram type, once", async () => {
    await withMermaidLineBreaks("flowchart TD\n  A --> B", noopRender);
    await withMermaidLineBreaks("graph LR\n  X --> Y", noopRender);
    await withMermaidLineBreaks('pie\n  "a" : 1', noopRender);

    expect(
      getDiagramFromText.mock.calls.map(([text]) => text.split("\n")[0])
    ).toEqual(["flowchart TD"]);
  });

  it("converts line breaks only while rendering", async () => {
    const definition = "flowchart TD\n  A[one\\ntwo]";
    const { db } = await mermaid.mermaidAPI.getDiagramFromText(definition);
    const getLabel = () => (db as any).getData().nodes[0].label;

    expect(getLabel()).toBe("one\\ntwo");
    expect(
      await withMermaidLineBreaks(definition, async () => getLabel())
    ).toBe("one<br/>two");
    expect(getLabel()).toBe("one\\ntwo");
  });

  it("retries installing hooks when loading the diagram failed", async () => {
    getDiagramFromText.mockRejectedValueOnce(new Error("chunk failed to load"));
    const definition = "sequenceDiagram\n  A->>B: one\\ntwo";

    await expect(
      withMermaidLineBreaks(definition, async () => "rendered")
    ).resolves.toBe("rendered");
    await withMermaidLineBreaks(definition, noopRender);

    expect(getDiagramFromText).toHaveBeenCalledTimes(2);
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
