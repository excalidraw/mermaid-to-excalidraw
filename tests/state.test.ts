import { DEFAULT_FONT_SIZE, NODE_BACKGROUND_COLOR } from "../src/constants.js";
import { graphToExcalidraw } from "../src/graphToExcalidraw.js";
import { parseDiagram } from "../src/parseDiagram.js";
import type { State } from "../src/interfaces.js";

describe("state diagrams", () => {
  const originalGetCanvasContext = HTMLCanvasElement.prototype.getContext;

  const browserMeasuredWidthPerFontSize = new Map<string, number>([
    ["The state with a note", 201.0959014892578 / 18],
    [
      "The state with a really long note that should wrap notes",
      508.2657165527344 / 18,
    ],
    ["State2", 63.73797607421875 / 18],
    ["State3", 62.08198547363281 / 18],
    ["State4", 61.66798400878906 / 18],
    ["This is the note to the left.", 255.00584411621094 / 18],
  ]);

  beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: function getContext(contextId: string) {
        if (contextId !== "2d") {
          return null;
        }

        return {
          font: "",
          measureText(text: string) {
            const fontSize = Number.parseFloat(this.font) || 0;
            const widthPerFontSize =
              browserMeasuredWidthPerFontSize.get(text) ?? text.length * 0.6;

            return {
              width: widthPerFontSize * fontSize,
            };
          },
        } as Pick<CanvasRenderingContext2D, "font" | "measureText">;
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: originalGetCanvasContext,
    });
  });

  it("renders note edges without arrowheads and choice states as diamonds", async () => {
    const graph = await parseDiagram(`stateDiagram-v2
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
        fontSize: DEFAULT_FONT_SIZE,
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
    const graph = await parseDiagram(`stateDiagram-v2
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

  it("converts line break syntax in state ids", async () => {
    const graph = await parseDiagram(`stateDiagram-v2
    Still --> Mov\\ning
    Moving --> Still
    class Moving movement
    class Still stopped`);
    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    expect(result.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.objectContaining({ text: "Mov\ning" }),
        }),
      ])
    );
  });

  it("normalizes state descriptions, transitions, and notes without phantom states", async () => {
    const graph = await parseDiagram(`stateDiagram-v2
    %% ignored<br>comment\\ntext
    A: First<br>Second
    A --> B: Edge\\nLabel
    note right of B: Note<br>Body`);
    expect(graph.type).toBe("state");

    const stateIds = graph.nodes
      .filter((node) => node.shape !== "note" && node.isRenderable)
      .map((node) => node.id);
    expect(stateIds).toEqual(["A", "B"]);

    const result = graphToExcalidraw(graph);
    const labels = result.elements
      .map((element: any) => element.label?.text)
      .filter(Boolean);

    expect(labels).toEqual(
      expect.arrayContaining([
        "First\nSecond",
        "B",
        "Edge\nLabel",
        "Note\nBody",
      ])
    );
    expect(labels.some((text: string) => text.includes("ignored"))).toBe(false);
    expect(labels.some((text: string) => text.includes("m2e_"))).toBe(false);
  });

  it("normalizes reserved-looking state descriptions and note bodies", async () => {
    const graph = await parseDiagram(`stateDiagram-v2
    style: First\\nSecond
    note right of style
      click\\nguide
    end note`);
    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    const labels = result.elements
      .map((element: any) => element.label?.text)
      .filter(Boolean);
    expect(labels).toEqual(
      expect.arrayContaining(["First\nSecond", "click\nguide"])
    );
  });

  it("does not preserve the default theme's colors for unstyled states and notes", async () => {
    const graph = await parseDiagram(`stateDiagram-v2
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

    // opaque in the canvas' color, not in the default theme's colors
    expect(idle?.backgroundColor).toBe(NODE_BACKGROUND_COLOR);
    expect(idle?.strokeColor).toBeUndefined();
    expect(active?.backgroundColor).toBe(NODE_BACKGROUND_COLOR);
    expect(active?.strokeColor).toBeUndefined();
    expect(note?.backgroundColor).toBe(NODE_BACKGROUND_COLOR);
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
    const graph = await parseDiagram(`stateDiagram-v2
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
    const graph = await parseDiagram(`stateDiagram-v2
    [*] --> Active
    Active --> [*]`);

    expect(graph.type).toBe("state");

    const endNode = graph.nodes.find((node) => node.shape === "stateEnd");
    const result = graphToExcalidraw(graph);
    const endState = result.elements.find(
      (element: any) => element.id === endNode?.id
    );
    const endStateInner = result.elements.find(
      (element: any) => element.id === `${endNode?.id}__inner`
    );

    expect(endState).toBeTruthy();
    expect(endStateInner).toMatchObject({
      type: "ellipse",
    });
    expect(endStateInner?.backgroundColor).toBe(endStateInner?.strokeColor);
    expect(endStateInner?.backgroundColor).toBeTruthy();
    expect(endStateInner?.width).toBeLessThan(endState?.width ?? Infinity);
    expect(endStateInner?.height).toBeLessThan(endState?.height ?? Infinity);
    expect(endState?.groupIds).toEqual(endStateInner?.groupIds);
    expect(endState?.groupIds).toEqual([
      `state_end_group_${String(endState?.id)}`,
    ]);
  });

  it("renders fork and join pseudo states as unlabeled bars", async () => {
    const graph = await parseDiagram(`stateDiagram-v2
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
    const graph = await parseDiagram(`stateDiagram-v2
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
    // at the font size Pele laid them out for (smaller for notes)
    expect(notedState?.label?.fontSize).toBe(state1Node?.fontSize);
    expect(leftNote?.label?.fontSize).toBe(leftNoteNode?.fontSize);
    expect(state2?.label?.fontSize).toBe(state2Node?.fontSize);
    expect(
      result.elements.filter(
        (element: any) =>
          element.type === "arrow" &&
          element.endArrowhead === null &&
          element.strokeStyle === "dashed"
      )
    ).toHaveLength(2);
  });

  it("keeps browser-sized state labels at the default 16px when wrapping already fits", () => {
    const graph: State = {
      type: "state",
      nodes: [
        {
          id: "State1",
          shape: "rect",
          text: "The state with a note",
          description: [],
          x: 0,
          y: 0,
          width: 209.375,
          height: 46,
          containerStyle: {},
          labelStyle: {},
          isRenderable: true,
        },
        {
          id: "State2",
          shape: "rect",
          text: "State2",
          description: [],
          x: 0,
          y: 0,
          width: 73.390625,
          height: 46,
          containerStyle: {},
          labelStyle: {},
          isRenderable: true,
        },
        {
          id: "State2----note-2",
          shape: "note",
          text: "This is the note to the left.",
          description: [],
          x: 0,
          y: 0,
          width: 230,
          height: 90,
          containerStyle: {},
          labelStyle: {},
          isRenderable: true,
        },
      ],
      edges: [],
    };

    const result = graphToExcalidraw(graph);
    const state1 = result.elements.find(
      (element: any) => element.id === "State1"
    );
    const state2 = result.elements.find(
      (element: any) => element.id === "State2"
    );
    const note = result.elements.find(
      (element: any) => element.id === "State2----note-2"
    );

    expect(state1?.label?.fontSize).toBe(16);
    expect(state2?.label?.fontSize).toBe(16);
    expect(note?.label?.fontSize).toBe(16);
  });

  it("keeps long single-line state labels at the default font size so they can wrap", () => {
    const graph: State = {
      type: "state",
      nodes: [
        {
          id: "State1",
          shape: "rect",
          text: "The state with a really long note that should wrap notes",
          description: [],
          x: 0,
          y: 0,
          width: 216,
          height: 106,
          containerStyle: {},
          labelStyle: {},
          isRenderable: true,
        },
      ],
      edges: [],
    };

    const result = graphToExcalidraw(graph);
    const state1 = result.elements.find(
      (element: any) => element.id === "State1"
    );

    expect(state1?.label?.fontSize).toBe(16);
  });

  it("supports spaces in state names together with ::: styling", async () => {
    const graph = await parseDiagram(`stateDiagram-v2
    classDef yourState fill:#ffec99,stroke:#c92a2a,color:#1864ab,stroke-width:2px
    yswsii: Your state with spaces in it
    [*] --> yswsii:::yourState
    yswsii --> YetAnotherState
    YetAnotherState --> [*]`);

    expect(graph.type).toBe("state");

    const result = graphToExcalidraw(graph);
    const state = result.elements.find(
      (element: any) => element.id === "yswsii"
    ) as any;
    expect(state).toMatchObject({
      type: "rectangle",
      backgroundColor: "#ffec99",
      strokeColor: "#c92a2a",
      strokeWidth: 2,
      label: {
        fontSize: DEFAULT_FONT_SIZE,
        strokeColor: "#1864ab",
      },
    });
    // (on as many lines as Pele wrapped it on)
    expect(state.label.text.replace(/\s+/g, " ")).toBe(
      "Your state with spaces in it"
    );
  });
});
