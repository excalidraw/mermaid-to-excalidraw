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
    name: "Composite states ",
    definition: `stateDiagram-v2
    [*] --> First
    state First {
        [*] --> second
        second --> [*]
    }
  `,
    type: "state",
  },
  {
    name: "Composite states in deep layers",
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
    name: "Transition between composite states",
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
    name: "Edge case when two composite states are connected by the same state",
    definition: `stateDiagram-v2
    [*] --> First
    state First {
        [*] --> second
        second --> [*]
    }
    state Second {
        [*] --> second
        second --> [*]
    }
`,
    type: "state",
  },
  {
    name: "Choice",
    definition: `stateDiagram-v2
    state if_state <<choice>>
    [*] --> IsPositive
    IsPositive --> if_state
    if_state --> False: if n < 0
    if_state --> True : if n >= 0
`,
    type: "state",
  },
  {
    name: "Choice in a composite state",
    definition: `stateDiagram-v2
    [*] --> First
    First --> Second
    First --> Third

    state First {
        [*] --> fir
        fir --> [*]
        
        state if_state <<choice>>
        [*] --> IsPositive
        IsPositive --> if_state
        if_state --> False: if n < 0
        if_state --> True : if n >= 0
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
    name: "Forks",
    definition: `stateDiagram-v2
    state fork_state <<fork>>
    fork_state --> State2
    fork_state --> State3
    [*] --> fork_state
    
    state join_state <<join>>
    State2 --> join_state
    State3 --> join_state
    join_state --> State4
    State4 --> [*]
`,
    type: "state",
  },
  {
    name: "Notes",
    definition: `stateDiagram-v2
    State1: The state with a note
    note right of State1
        Important information! You can write
        notes.
    end note
    State1 --> State2
    note left of State2 : This is the note to the left.
`,
    type: "state",
  },
  {
    name: "Note left and right in same state",
    definition: `stateDiagram-v2
    State1: The state with a note
    note right of State1
        Important information! You can write
        notes.
    end note
    note left of State1 : This is the note to the left.
`,
    type: "state",
  },
  {
    name: "Multiple notes in the same state",
    definition: `stateDiagram-v2
    State1: The state with a note
    note right of State1
        Important information! You can write
        notes.
    end note
    note left of State1 : Left.
    note left of State1 : Join.
    note left of State1 : Out.
    note right of State1 : Ok!.
`,
    type: "state",
  },
  {
    name: "Notes inside a composite state",
    definition: `stateDiagram-v2
    [*] --> First
    state First {
        [*] --> second
        second --> [*]

        note right of second
        First is a composite state
        end note
  
    }
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
    type: "state",
  },
];
