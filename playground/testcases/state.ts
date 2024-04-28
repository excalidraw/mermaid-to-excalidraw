import type { TestCase } from "../SingleTestCase";

export const STATE_DIAGRAM_TESTCASES: TestCase[] = [
  {
    name: "Declare a state with just an id",
    definition: `stateDiagram-v2
    Stateid
    `,
    type: "state",
  },
  {
    name: "Declare a state with description",
    definition: `stateDiagram-v2
    state "This is a state description" as s2
    `,
    type: "state",
  },
  {
    name: "Declare a state with description using another syntax",
    definition: `stateDiagram-v2
    s2 : This is a state description
    `,
    type: "state",
  },
  {
    name: "Simple Transition",
    definition: `stateDiagram-v2
    s1 --> s2
    `,
    type: "state",
  },
  {
    name: "Simple transition with a text",
    definition: `stateDiagram-v2
    s1 --> s2: Transition Description
    `,
    type: "state",
  },
  {
    name: "Start and End ",
    definition: `stateDiagram-v2
        [*] --> s1
        s1 --> [*]
        `,
    type: "state",
  },
  {
    name: "Sample 1",
    definition: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
    `,
  },
];
