import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parseMermaid } from "../src/parseMermaid.js";

type BBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const zeroBox = (): BBox => ({ x: 0, y: 0, width: 0, height: 0 });

const numberAttr = (element: Element, attribute: string, fallback = 0) => {
  const rawValue = element.getAttribute(attribute);
  return rawValue === null ? fallback : Number(rawValue);
};

const unionBoxes = (boxes: BBox[]): BBox => {
  if (boxes.length === 0) {
    return zeroBox();
  }

  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const parsePointsBox = (points: string | null): BBox => {
  if (!points) {
    return zeroBox();
  }

  const coordinates = points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map((value) => Number(value)))
    .filter(
      (pair): pair is [number, number] =>
        pair.length === 2 &&
        Number.isFinite(pair[0]) &&
        Number.isFinite(pair[1])
    );

  if (coordinates.length === 0) {
    return zeroBox();
  }

  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
};

const parsePathBox = (pathData: string | null): BBox => {
  if (!pathData) {
    return zeroBox();
  }

  const numericTokens = Array.from(
    pathData.matchAll(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi),
    (match) => Number(match[0])
  );

  if (numericTokens.length < 2) {
    return zeroBox();
  }

  const coordinates: Array<[number, number]> = [];
  for (let index = 0; index < numericTokens.length - 1; index += 2) {
    coordinates.push([numericTokens[index], numericTokens[index + 1]]);
  }

  const xs = coordinates.map(([x]) => x);
  const ys = coordinates.map(([, y]) => y);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
};

const getMockBBox = (element: SVGElement): BBox => {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case "rect":
    case "foreignobject":
    case "image":
      return {
        x: numberAttr(element, "x"),
        y: numberAttr(element, "y"),
        width: numberAttr(element, "width"),
        height: numberAttr(element, "height"),
      };
    case "circle": {
      const r = numberAttr(element, "r");
      const cx = numberAttr(element, "cx");
      const cy = numberAttr(element, "cy");
      return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
    }
    case "ellipse": {
      const rx = numberAttr(element, "rx");
      const ry = numberAttr(element, "ry");
      const cx = numberAttr(element, "cx");
      const cy = numberAttr(element, "cy");
      return { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 };
    }
    case "line": {
      const x1 = numberAttr(element, "x1");
      const y1 = numberAttr(element, "y1");
      const x2 = numberAttr(element, "x2");
      const y2 = numberAttr(element, "y2");
      return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      };
    }
    case "polygon":
    case "polyline":
      return parsePointsBox(element.getAttribute("points"));
    case "path":
      return parsePathBox(element.getAttribute("d"));
    case "text":
    case "tspan": {
      const x = numberAttr(element, "x");
      const y = numberAttr(element, "y");
      const text = element.textContent ?? "";
      return {
        x,
        y,
        width: Math.max(text.length * 8, 1),
        height: 16,
      };
    }
    default: {
      const childBoxes = Array.from(element.children)
        .filter((child): child is SVGElement => child instanceof SVGElement)
        .map((child) => getMockBBox(child))
        .filter((box) => box.width > 0 || box.height > 0);

      return unionBoxes(childBoxes);
    }
  }
};

describe("state diagrams", () => {
  const originalGetBBox = SVGElement.prototype.getBBox;
  const originalGetBoundingClientRect =
    SVGElement.prototype.getBoundingClientRect;
  const originalGetComputedTextLength =
    SVGElement.prototype.getComputedTextLength;

  beforeAll(() => {
    Object.defineProperty(SVGElement.prototype, "getBBox", {
      configurable: true,
      value: function getBBox() {
        return getMockBBox(this);
      },
    });

    Object.defineProperty(SVGElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: function getBoundingClientRect() {
        const box = getMockBBox(this);
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

  it("renders note edges without arrowheads and choice states as diamonds", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    state Decision <<choice>>
    [*] --> Input
    Input --> Decision
    note right of Input: Capture payload
    Decision --> Accept: valid
    Decision --> Reject: invalid`);

    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    expect(
      result.elements.find((element: any) => element.type === "diamond")
    ).toBeTruthy();
    expect(
      result.elements.find(
        (element: any) =>
          element.type === "rectangle" &&
          element.label?.text === "Capture payload"
      )
    ).toBeTruthy();
    expect(
      result.elements.find((element: any) => element.id === "Input")
    ).toMatchObject({
      label: {
        fontSize: 18,
      },
    });
    expect(
      result.elements.find(
        (element: any) =>
          element.type === "arrow" &&
          element.endArrowhead === null &&
          element.strokeStyle === "dashed"
      )
    ).toBeTruthy();
    expect(
      result.elements
        .filter(
          (element: any) =>
            element.type === "arrow" && element.endArrowhead === "triangle"
        )
        .every((element: any) => element.strokeStyle === "solid")
    ).toBe(true);
  });

  it("preserves state class and direct style overrides", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    classDef movement fill:#f00,color:white,font-weight:bold,stroke-width:2px,stroke:yellow
    A --> B
    class A,B movement
    style B fill:#0f0,stroke:#333,stroke-width:4px,color:#00f`);

    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    expect(
      result.elements.find((element: any) => element.id === "A")
    ).toMatchObject({
      backgroundColor: "#f00",
      strokeColor: "yellow",
      strokeWidth: 2,
      label: {
        strokeColor: "white",
      },
    });
    expect(
      result.elements.find((element: any) => element.id === "B")
    ).toMatchObject({
      backgroundColor: "#0f0",
      strokeColor: "#333",
      strokeWidth: 4,
      label: {
        strokeColor: "#00f",
      },
    });
  });

  it("does not preserve Mermaid default colors for unstyled states and notes", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    [*] --> Idle
    Idle --> Active
    note right of Active: Default note
    Active --> [*]`);

    expect(graph.type).toBe("state");

    const startNode = graph.nodes.find((node) => node.shape === "stateStart");
    const endNode = graph.nodes.find((node) => node.shape === "stateEnd");
    const result = graphToExcalidraw(graph);
    const idle = result.elements.find((element: any) => element.id === "Idle");
    const active = result.elements.find(
      (element: any) => element.id === "Active"
    );
    const note = result.elements.find(
      (element: any) =>
        element.type === "rectangle" && element.label?.text === "Default note"
    );
    const start = result.elements.find(
      (element: any) => element.id === startNode?.id
    );
    const endInner = result.elements.find(
      (element: any) => element.id === `${endNode?.id}__inner`
    );

    expect(idle?.backgroundColor).toBeUndefined();
    expect(idle?.strokeColor).toBeUndefined();
    expect(active?.backgroundColor).toBeUndefined();
    expect(active?.strokeColor).toBeUndefined();
    expect(note?.backgroundColor).toBeUndefined();
    expect(note?.strokeColor).toBeUndefined();
    expect(start).toMatchObject({
      type: "ellipse",
      backgroundColor: "#000000",
      strokeColor: "#000000",
    });
    expect(endInner).toMatchObject({
      type: "ellipse",
      backgroundColor: "#000000",
      strokeColor: "#000000",
    });
  });

  it("renders titled states with a divider line without grouping", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    state Group {
      state "Header" as A
      A : body
    }`);

    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    const group = result.elements.find(
      (element: any) => element.id === "Group"
    );
    const titledState = result.elements.find(
      (element: any) => element.id === "A"
    );
    const divider = result.elements.find(
      (element: any) => element.id === "A__divider"
    );

    expect(group).toBeTruthy();
    expect(titledState).toMatchObject({
      type: "rectangle",
      label: {
        text: "Header\nbody",
        verticalAlign: "top",
      },
    });
    expect(group?.groupIds).toBeUndefined();
    expect(titledState?.groupIds).toBeUndefined();
    expect(titledState?.label?.groupIds).toBeUndefined();
    expect(divider?.groupIds).toBeUndefined();
  });

  it("renders end states with a colored inner marker", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    [*] --> Active
    Active --> [*]`);

    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    const endState = result.elements.find(
      (element: any) =>
        element.type === "ellipse" &&
        !String(element.id).endsWith("__inner") &&
        element.id !== "[*]_start"
    );
    const endStateInner = result.elements.find((element: any) =>
      String(element.id).endsWith("__inner")
    );

    expect(endState).toBeTruthy();
    expect(endStateInner).toMatchObject({
      type: "ellipse",
    });
    expect(endStateInner?.backgroundColor).toBe(endStateInner?.strokeColor);
    expect(endStateInner?.backgroundColor).toBeTruthy();
    expect(endStateInner?.width).toBeLessThan(endState?.width ?? Infinity);
    expect(endStateInner?.height).toBeLessThan(endState?.height ?? Infinity);
  });

  it("renders fork and join pseudo states as unlabeled bars", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    state fork_state <<fork>>
    [*] --> fork_state
    fork_state --> State2
    fork_state --> State3

    state join_state <<join>>
    State2 --> join_state
    State3 --> join_state
    join_state --> State4
    State4 --> [*]`);

    expect(graph.type).toBe("state");

    const forkAndJoinNodes = graph.nodes.filter(
      (node) => node.shape === "fork" || node.shape === "join"
    );
    expect(forkAndJoinNodes).toHaveLength(2);

    const result = graphToExcalidraw(graph);
    for (const node of forkAndJoinNodes) {
      const element = result.elements.find(
        (entry: any) => entry.id === node.id
      );
      expect(element).toMatchObject({
        type: "rectangle",
        backgroundColor: "#000000",
        strokeColor: "#000000",
      });
      expect((element as any)?.label).toBeUndefined();
      expect(
        Math.min(
          (element as any)?.width ?? Infinity,
          (element as any)?.height ?? Infinity
        )
      ).toBeLessThanOrEqual(12);
    }
  });

  it("renders multiline notes from the docs as note rectangles with dashed note edges", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    State1: The state with a note
    note right of State1
      Important information!
      You can write notes.
    end note
    State1 --> State2
    note left of State2 : This is the note to the left.`);

    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    const state1Node = graph.nodes.find((node) => node.id === "State1");
    const multilineNoteNode = graph.nodes.find(
      (node) =>
        node.shape === "note" &&
        node.text === "Important information!\nYou can write notes."
    );
    const leftNoteNode = graph.nodes.find(
      (node) =>
        node.shape === "note" && node.text === "This is the note to the left."
    );
    const state2Node = graph.nodes.find((node) => node.id === "State2");
    const notedState = result.elements.find(
      (element: any) => element.id === "State1"
    );
    const multilineNote = result.elements.find(
      (element: any) =>
        element.type === "rectangle" &&
        typeof element.label?.text === "string" &&
        element.label.text.includes("Important information!")
    );
    const leftNote = result.elements.find(
      (element: any) =>
        element.type === "rectangle" &&
        element.label?.text === "This is the note to the left."
    );
    const state2 = result.elements.find(
      (element: any) => element.id === "State2"
    );

    expect(
      multilineNote &&
        multilineNote.label?.text.includes("You can write notes.")
    ).toBe(true);
    expect(multilineNote?.label?.text).toBe(
      "Important information!\nYou can write notes."
    );
    expect(
      result.elements.find(
        (element: any) =>
          element.type === "rectangle" &&
          element.label?.text === "This is the note to the left."
      )
    ).toBeTruthy();
    expect(notedState?.width).toBe(state1Node?.width);
    expect(multilineNote?.width).toBe(multilineNoteNode?.width);
    expect(leftNote?.width).toBe(leftNoteNode?.width);
    expect(state2?.width).toBe(state2Node?.width);
    expect(notedState?.label?.fontSize).toBe(18);
    expect(leftNote?.label?.fontSize).toBe(18);
    expect(state2?.label?.fontSize).toBe(18);
    expect(
      result.elements.filter(
        (element: any) =>
          element.type === "arrow" &&
          element.endArrowhead === null &&
          element.strokeStyle === "dashed"
      )
    ).toHaveLength(2);
  });

  it("supports spaces in state names together with ::: styling", async () => {
    const graph = await parseMermaid(`stateDiagram-v2
    classDef yourState fill:#ffec99,stroke:#c92a2a,color:#1864ab,stroke-width:2px
    yswsii: Your state with spaces in it
    [*] --> yswsii:::yourState
    yswsii --> YetAnotherState
    YetAnotherState --> [*]`);

    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    expect(
      result.elements.find((element: any) => element.id === "yswsii")
    ).toMatchObject({
      type: "rectangle",
      backgroundColor: "#ffec99",
      strokeColor: "#c92a2a",
      strokeWidth: 2,
      label: {
        text: "Your state with spaces in it",
        fontSize: 18,
        strokeColor: "#1864ab",
      },
    });
  });
});
