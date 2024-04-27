import type { TestCase } from "../SingleTestCase";

export const STATE_DIAGRAM_TESTCASES: TestCase[] = [
  {
    name: "Start and End ",
    definition: `stateDiagram-v2
        [*] --> s1
        s1 --> [*]
        `,
    type: "state",
  },
];
