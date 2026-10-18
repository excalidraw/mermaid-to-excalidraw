import type { TestCase } from "../SingleTestCase";

// Line breaks via `<br>`, `<br/>` and `\n` across diagram types. Kept as a
// separate category so adding cases doesn't shift the visual test indexes of
// the per-diagram categories.
export const LINE_BREAK_TESTCASES: TestCase[] = [
  {
    type: "flowchart",
    name: "Flowchart labels",
    definition: `flowchart TD
  A[User's<br>profile] -->|tag<br/>break| B(Escaped\\nnewline)
  B -- long edge\\nlabel --> C([Stadium<br />node])
  C --> D["\`**Markdown**\\nstring\`"]
  C --> E[Literal \\\\n stays]`,
  },
  {
    type: "flowchart",
    name: "Flowchart multiline subgraph titles",
    definition: `flowchart LR
  X[outside] --> A
  subgraph one [Title line one<br>line two<br>line three]
    A[a] --> B[b]
  end
  B --> Y[after]
  Z[below] --> Y`,
  },
  {
    type: "flowchart",
    name: "Flowchart bare ids with multiline directive",
    definition: `%%{
  init: { "flowchart": { "curve": "linear" } }
}%%
flowchart TD
  A[Don't split] --> Mov\\ning
  Mov\\ning --> Still`,
  },
  {
    type: "sequence",
    name: "Sequence participants, messages and frames",
    definition: `sequenceDiagram
  box Aqua Front<br>end
    participant A as Alice<br>Smith
    actor B as Bob\\nJones
  end
  A->>B: hello\\nworld
  Note over A,B: note<br/>line two
  loop every<br>minute
    B-->>A: ping
  end
  alt is<br>sick
    B->>A: not so good
  else is\\nwell
    B->>A: feeling fresh
  end`,
  },
  {
    type: "class",
    name: "Class labels, members and relations",
    definition: `classDiagram
  class Animal["Animal<br>base"] {
    +String name
    +int ag\\ne
    +eat(fo<br>od) void
  }
  class Duck
  Animal <|-- Duck : inherits\\nfrom
  note for Duck "can<br>swim"`,
  },
  {
    type: "erd",
    name: "ER entities, attributes and relationships",
    definition: `erDiagram
  CUSTOMER["Customer<br>account"] {
    string name PK "the<br>comment"
    int id FK
    string email UK "login\\naddress"
  }
  CUSTOMER ||--o{ ORDER : "places\\nmany"`,
  },
  {
    type: "state",
    name: "State transitions, descriptions and notes",
    definition: `stateDiagram-v2
  state "Waiting<br>for input" as Waiting
  [*] --> Waiting
  Waiting --> Moving : go\\nnow
  note right of Moving
    first\\nsecond
  end note
  Moving --> [*]`,
  },
  {
    type: "flowchart",
    name: "Flowchart <br> in bare ids and subgraph titles",
    definition: `flowchart LR
  subgraph Back<br>end
    API<br>server --> DB[(Data<br>base)]
  end
  Web<br>app --> API<br>server
  style Web<br>app fill:#d0ebff`,
  },
  {
    type: "sequence",
    name: "Sequence <br> in bare participants",
    definition: `sequenceDiagram
  participant Web<br>app
  actor Admin<br>user
  Admin<br>user->>Web<br>app: Log<br>in
  Web<br>app-->>Admin<br>user: OK`,
  },
];
