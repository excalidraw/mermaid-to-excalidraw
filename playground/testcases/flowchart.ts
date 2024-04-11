export default [
  {
    name: "Direction TD",
    definition: `flowchart TD
Start --> Stop
`,
  },
  {
    name: "Direction LR",
    definition: `flowchart LR
Start --> Stop
`,
  },
  {
    name: "A node with round edges",
    definition: `flowchart LR
id1(This is the text in the box)
`,
  },
  {
    name: "A stadium-shaped node ",
    definition: `flowchart LR
id1([This is the text in the box])
`,
  },
  {
    name: "A node in a subroutine shape",
    definition: `flowchart LR
id1[[This is the text in the box]]
`,
  },
  {
    name: "A node in a cylindrical shape",
    definition: `flowchart LR
id1[(Database)]
`,
  },
  {
    name: "A node in the form of a circle",
    definition: `flowchart LR
id1((This is the text in the circle))
`,
  },
  {
    name: "A node in an asymmetric shape",
    definition: `flowchart LR
id1>This is the text in the box]
`,
  },
  {
    name: "A node (rhombus)",
    definition: `flowchart LR
id1{This is the text in the box}
`,
  },
  {
    name: "A hexagon node",
    definition: `flowchart LR
id1{{This is the text in the box}}
`,
  },
  {
    name: "Parallelogram",
    definition: `flowchart TD
id1[/This is the text in the box/]
`,
  },
  {
    name: "Parallelogram with alt text",
    definition: `flowchart TD
id1[\\This is the text in the box\\]
`,
  },
  {
    name: "Trapezoid",
    definition: `flowchart TD
A[/Christmas\\]
`,
  },
  {
    name: "Trapezoid alt",
    definition: `flowchart TD
B[\\Go shopping/]
`,
  },
  {
    name: "Double circle",
    definition: `flowchart TD
id1(((This is the text in the circle)))
`,
  },
  {
    name: "A link with arrow head",
    definition: `flowchart LR
A-->B
`,
  },
  {
    name: "A link with arrow head and text",
    definition: `flowchart LR
A-->|text|B
`,
  },
  {
    name: "A link with arrow head and text using another syntax",
    definition: `flowchart LR
A-- text -->B
`,
  },
  {
    name: "Dotted link",
    definition: `flowchart LR
A-.->B;
`,
  },
  {
    name: "Dotted link with text",
    definition: `flowchart LR
A-. text .-> B
`,
  },
  {
    name: "An open link ",
    definition: `flowchart LR
A --- B
`,
  },
  {
    name: "An open link with text",
    definition: `flowchart LR
A-- This is the text! ---B
`,
  },
  {
    name: "An open link with text using another syntax",
    definition: `flowchart LR
A---|This is the text|B
`,
  },
  {
    name: "Thick link",
    definition: `flowchart LR
A ==> B
`,
  },
  {
    name: "Thick link with text",
    definition: `flowchart LR
A == text ==> B
`,
  },
  {
    name: "Chaining of links",
    definition: `flowchart LR
A -- text --> B -- text2 --> C
`,
  },
  {
    name: "Multiple nodes links in the same line",
    definition: `flowchart LR
a --> b & c--> d
`,
  },
  {
    name: "Multiple nodes links to describe a dependencies",
    definition: `flowchart TB
A & B--> C & D
`,
  },
  {
    name: "Multiple nodes linkes to describe a dependencies using another syntax",
    definition: `flowchart TB
A --> C
A --> D
B --> C
B --> D
`,
  },
  {
    name: "Circle arrow and Cross arrow",
    definition: `flowchart LR
A --o B
B --x C
`,
  },
  {
    name: "Multi directional arrows",
    definition: `flowchart LR
A o--o B
B <--> C
C x--x D
`,
  },
  {
    name: "Special characters that break syntax",
    definition: `flowchart LR
id1["This is the (text) in the box"]
`,
  },
  {
    name: "Entity codes to escape characters",
    definition: `flowchart LR
A["A double quote:#quot;"] -->B["A dec char:#9829;"]
`,
  },
  {
    name: "Subgraphs",
    definition: `flowchart TB
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
  },
  {
    name: "Subgraph with explicit id",
    definition: `flowchart TB
c1-->a2
subgraph ide1 [one]
a1-->a2
end
`,
  },
  {
    name: "Links between subgraphs",
    definition: `flowchart TB
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
  },
  {
    name: "Direction in subgraphs",
    definition: `flowchart LR
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
  },
  {
    name: "Markdown Strings",
    definition: `flowchart LR
subgraph "One"
a("\`The **cat**
in the hat\`") -- "edge label" --> b{{"\`The **dog** in the hog\`"}}
end
subgraph "\`Two\`"
c("\`The **cat**
in the hat\`") -- "\`Bold **edge label**\`" --> d("The dog in the hog")
end
`,
  },
  {
    name: "Interaction using tooltip",
    definition: `flowchart LR
A-->B
B-->C
C-->D
click A callback "Tooltip for a callback"
click B "https://www.github.com" "This is a tooltip for a link"
click A call callback() "Tooltip for a callback"
click B href "https://www.github.com" "This is a tooltip for a link"
`,
  },
  {
    name: "Interaction using link",
    definition: `flowchart LR
A-->B
B-->C
C-->D
D-->E
click A "https://www.github.com" _blank
click B "https://www.github.com" "Open this in a new tab" _blank
click C href "https://www.github.com" _blank
click D href "https://www.github.com" "Open this in a new tab" _blank
`,
  },
  {
    name: "Comments",
    definition: `flowchart LR
%% this is a comment A -- text --> B{node}
A -- text --> B -- text2 --> C
`,
  },
  {
    name: "Styling a node",
    definition: `flowchart LR
id1(Start)-->id2(Stop)
style id1 fill:#f9f,stroke:#333,stroke-width:4px
style id2 fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5
`,
  },
  {
    name: "Classes",
    definition: `flowchart LR
A-->B[AAABBB]
B-->D
class A cssClass
`,
  },
  {
    name: "Basic support for fontawesome",
    definition: `flowchart TD
B["fab:fa-twitter for peace"]
B-->C[fa:fa-ban forbidden]
B-->D(fa:fa-spinner)
B-->E(A fa:fa-camera-retro perhaps?)
`,
  },
  {
    name: "Graph declarations with spaces between vertices and link and without semicolon",
    definition: `flowchart LR
A[Hard edge] -->|Link text| B(Round edge)
B --> C{Decision}
C -->|One| D[Result one]
C -->|Two| E[Result two]
`,
  },
  {
    name: "Complex Case 1",
    definition: `flowchart TD
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
  },
  {
    name: "Complex Case 2",
    definition: `flowchart TD

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
  },
];
