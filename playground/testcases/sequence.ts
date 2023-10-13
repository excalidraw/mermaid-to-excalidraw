const SEQUENCE_DIAGRAM_TESTCASES = [
  {
    name: "Solid and dotted line without arrow",
    defination: `sequenceDiagram
  Alice->John: Hello John, how are you?
  John-->Alice: Great!
  Alice->John: See you later!`,
  },
  {
    name: "Solid and dotted line with arrow head",
    defination: `sequenceDiagram
  Alice->>John: Hello John, how are you?
  John-->>Alice: Great!
  Alice->>John: See you later!`,
  },
  {
    name: "Solid and Dotted line with cross at end",
    defination: `sequenceDiagram
  Alice-xJohn: Hello John, how are you?
  John--xAlice: Great!
  Alice-xJohn: See you later!`,
  },
  {
    name: "Solid and dotted line with open arrow at end",
    defination: `sequenceDiagram
  Alice-)John: Hello John, how are you?
  John--)Alice: Great!
  Alice-)John: See you later!`,
  },
  {
    name: "Actor symbols",
    defination: `sequenceDiagram
    actor Alice
    actor Bob
    Alice->>Bob: Hi Bob
    Bob->>Alice: Hi Alice`,
  },
  {
    name: "Identifiers",
    defination: `sequenceDiagram
    participant A as Alice
    participant J as John
    A->>J: Hello John, how are you?
    J->>A: Great!`,
  },
  {
    name: "Notes",
    defination: `sequenceDiagram
    participant Alice
    Note left of Alice: This is a note
    Note right of Alice: Hey I am coming soon!`,
  },
];

export { SEQUENCE_DIAGRAM_TESTCASES };
