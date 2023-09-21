export default [
  `flowchart TD
Start --> Stop
`,
  `flowchart LR
Start --> Stop
`,
  `flowchart LR
id1(This is the text in the box)
`,
  `flowchart LR
id1([This is the text in the box])
`,
  `flowchart LR
id1[[This is the text in the box]]
`,
  `flowchart LR
id1[(Database)]
`,
  `flowchart LR
id1((This is the text in the circle))
`,
  `flowchart LR
id1>This is the text in the box]
`,
  `flowchart LR
id1{This is the text in the box}
`,
  `flowchart LR
id1{{This is the text in the box}}
`,
  `flowchart TD
id1[/This is the text in the box/]
`,
  `flowchart TD
id1[\\This is the text in the box\\]
`,
  `flowchart TD
A[/Christmas\\]
`,
  `flowchart TD
B[\\Go shopping/]
`,
  `flowchart TD
id1(((This is the text in the circle)))
`,
  `flowchart LR
A-->B
`,
  `flowchart LR
A-->|text|B
`,
  `flowchart LR
A-- text -->B
`,
  `flowchart LR
A-.->B;
`,
  `flowchart LR
A-. text .-> B
`,
  `flowchart LR
A ==> B
`,
  `flowchart LR
A == text ==> B
`,
  `flowchart LR
A -- text --> B -- text2 --> C
`,
  `flowchart LR
a --> b & c--> d
`,
  `flowchart TB
A & B--> C & D
`,
  `flowchart TB
A --> C
A --> D
B --> C
B --> D
`,
  `flowchart LR
A --o B
B --x C
`,
  `flowchart LR
A o--o B
B <--> C
C x--x D
`,
  `flowchart LR
id1["This is the (text) in the box"]
`,
  `    flowchart LR
    A["A double quote:#quot;"] -->B["A dec char:#9829;"]
`,
  `flowchart TB
c1-->a2
subgraph one
a1-->a2
end
subgraph two
b1-->b2
end
subgraph three
c1-->c2
end
`,
  `flowchart TB
c1-->a2
subgraph ide1 [one]
a1-->a2
end
`,
  `flowchart TB
c1-->a2
subgraph one
a1-->a2
end
subgraph two
b1-->b2
end
subgraph three
c1-->c2
end
one --> two
three --> two
two --> c2
`,
  `flowchart LR
subgraph TOP
direction TB
subgraph B1
    direction RL
    i1 -->f1
end
subgraph B2
    direction BT
    i2 -->f2
end
end
A --> TOP --> B
B1 --> B2
`,
  `flowchart LR
subgraph "One"
a("\`The **cat**
in the hat\`") -- "edge label" --> b{{"\`The **dog** in the hog\`"}}
end
subgraph "\`Two\`"
c("\`The **cat**
in the hat\`") -- "\`Bold **edge label**\`" --> d("The dog in the hog")
end
`,
  `flowchart LR
A-->B
B-->C
C-->D
click A callback "Tooltip for a callback"
click B "https://www.github.com" "This is a tooltip for a link"
click A call callback() "Tooltip for a callback"
click B href "https://www.github.com" "This is a tooltip for a link"
`,
  `flowchart LR
A-->B
B-->C
C-->D
D-->E
click A "https://www.github.com" _blank
click B "https://www.github.com" "Open this in a new tab" _blank
click C href "https://www.github.com" _blank
click D href "https://www.github.com" "Open this in a new tab" _blank
`,
  `flowchart LR
%% this is a comment A -- text --> B{node}
A -- text --> B -- text2 --> C
`,
  `flowchart LR
id1(Start)-->id2(Stop)
style id1 fill:#f9f,stroke:#333,stroke-width:4px
style id2 fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5
`,
  `flowchart LR
A-->B[AAABBB]
B-->D
class A cssClass
`,
  `flowchart TD
B["fab:fa-twitter for peace"]
B-->C[fa:fa-ban forbidden]
B-->D(fa:fa-spinner)
B-->E(A fa:fa-camera-retro perhaps?)
`,
  `flowchart LR
A[Hard edge] -->|Link text| B(Round edge)
B --> C{Decision}
C -->|One| D[Result one]
C -->|Two| E[Result two]
`,
  `flowchart TD
  A[Start] --> B{Decision 1}
  B -->|Yes| C[Action 1]
  B -->|No| D[Action 2]
  C --> E{Decision 2}
  D --> E
  E -->|Yes| F[Action 3]
  E -->|No| G[Action 4]
  F --> H{Decision 3}
  G --> H
  H -->|Yes| I[Action 5]
  H -->|No| J[Action 6]
  I --> K[End]
  J --> K`,
  `flowchart TD

  A[Start] --> B[Initialize]

  B[Initialize] --> C[Input Data]
  C[Input Data] --> D{Data Valid?}

  D{Data Valid?} -- Yes --> E[Process Data]
  E[Process Data] --> F{More Data?}
  F{More Data?} -- Yes --> C[Input Data]
  F{More Data?} -- No --> G[Generate Output]

  D{Data Valid?} -- No --> I[Report Error]
  I[Report Error] --> H[End]

  B[Initialize] --> J[Task 1]
  J[Task 1] --> K[Task 2]
  K[Task 2] --> L[Task 3]
  L[Task 3] --> M[Task 4]
  M[Task 4] --> N[Task 5]
  N[Task 5] --> O[Task 6]
  O[Task 6] --> P[Task 7]
  P[Task 7] --> Q[Task 8]
  Q[Task 8] --> R[Task 9]
  R[Task 9] --> S[Task 10]
  S[Task 10] --> T[End]

  U[Decision] --> V[Decision Point]
  V[Decision Point] --> W{Condition 1}
  W{Condition 1} -- Yes --> X[Option 1]
  X[Option 1] --> Y[End Option 1]
  W{Condition 1} -- No --> Z[Option 2]
  Z[Option 2] --> Y[End Option 2]
  Y[End Option 1] --> U[Decision]

  AA[Loop] --> AB[Loop Start]
  AB[Loop Start] --> AC[Loop Condition]
  AC[Loop Condition] -- Yes --> AD[Loop Task]
  AD[Loop Task] --> AE[Loop End]
  AC[Loop Condition] -- No --> AF[Exit Loop]
  AF[Exit Loop] --> AE[Loop End]
  AE[Loop End] --> AA[Loop]

  AG[Subprocess] --> AH[Start Subprocess]
  AH[Start Subprocess] --> AI[Subprocess Task 1]
  AI[Subprocess Task 1] --> AJ[Subprocess Task 2]
  AJ[Subprocess Task 2] --> AK[Subprocess Task 3]
  AK[Subprocess Task 3] --> AL[End Subprocess]

  A[Start] --> B[Initialize]
  B[Initialize] --> J[Task 1]
  J[Task 1] --> U[Decision]
  U[Decision] --> AA[Loop]
  AA[Loop] --> AG[Subprocess]
  AG[Subprocess] --> J[Task 1]
  AG[Subprocess] --> B[Initialize]
`,
];
