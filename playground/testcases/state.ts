import type { TestCase } from "../SingleTestCase";

export const STATE_DIAGRAM_TESTCASES: TestCase[] = [
  {
    name: "Simple Transition",
    definition: `stateDiagram-v2
    [*] --> Idle
    Idle --> Active: Start
    Active --> [*]
`,
    type: "state",
  },
  {
    name: "Choice and Notes",
    definition: `stateDiagram-v2
    state Decision <<choice>>
    [*] --> Input
    Input --> Decision
    note right of Input: Capture payload
    Decision --> Accept: valid
    Decision --> Reject: invalid
`,
    type: "state",
  },
  {
    name: "Composite State",
    definition: `stateDiagram-v2
    [*] --> Session
    state Session {
      [*] --> Ready
      Ready --> Busy
      Busy --> Ready
    }
`,
    type: "state",
  },
  {
    name: "Composite State Transitions",
    definition: `stateDiagram-v2
    [*] --> First
    First --> Second
    First --> Third
    state First {
      [*] --> fir
      fir --> [*]
    }
    state Second {
      [*] --> sec
      sec --> [*]
    }
    state Third {
      [*] --> thi
      thi --> [*]
    }
`,
    type: "state",
  },
  {
    name: "Nested Composite States",
    definition: `stateDiagram-v2
    [*] --> First
    state First {
      [*] --> Second
      state Second {
        [*] --> second
        second --> Third
        state Third {
          [*] --> third
          third --> [*]
        }
      }
    }
`,
    type: "state",
  },
  {
    name: "Concurrency",
    definition: `stateDiagram-v2
    state Active {
      [*] --> Left
      --
      [*] --> Right
    }
`,
    type: "state",
  },
  {
    name: "Fork and Join",
    definition: `stateDiagram-v2
    state fork_state <<fork>>
    [*] --> fork_state
    fork_state --> State2
    fork_state --> State3

    state join_state <<join>>
    State2 --> join_state
    State3 --> join_state
    join_state --> State4
    State4 --> [*]
`,
    type: "state",
  },
  {
    name: "Multiline Notes",
    definition: `stateDiagram-v2
    State1: The state with a really long note that should wrap notes
    note right of State1
      Important information!
      You can write notes.
    end note
    State1 --> State2
    note left of State2 : This is the note to the left.
`,
    type: "state",
  },
  {
    name: "Styling",
    definition: `stateDiagram-v2
    classDef movement fill:#f00,color:white,stroke-width:2px,stroke:yellow
    classDef stopped fill:#fff,stroke:#1f1f1f
    Still --> Moving
    Moving --> Still
    class Moving movement
    class Still stopped
    style Still color:#1f1f1f
`,
    type: "state",
  },
  {
    name: "Direction and Comments",
    definition: `stateDiagram-v2
    direction LR
    [*] --> A
    A --> B
    %% nested states may set their own direction
    state B {
      direction LR
      a --> b
    }
    B --> D
`,
    type: "state",
  },
  {
    name: "Spaces and Inline Styles",
    definition: `stateDiagram-v2
    classDef yourState fill:#ffec99,stroke:#c92a2a,color:#1864ab,stroke-width:2px
    yswsii: Your state with spaces in it
    [*] --> yswsii:::yourState
    [*] --> SomeOtherState
    SomeOtherState --> YetAnotherState
    yswsii --> YetAnotherState
    YetAnotherState --> [*]
`,
    type: "state",
  },
];
