const SEQUENCE_DIAGRAM_TESTCASES = [
  {
    name: "Solid and dotted line without arrow",
    defination: `sequenceDiagram
  Alice->John: Hello John, how are you?
  John-->Alice: Great!`,
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
  John--xAlice: Great!`,
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
    name: "Aliases",
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
  {
    name: "Activations",
    defination: `sequenceDiagram
    Alice->>+John: Hello John, how are you?
    Alice->>+John: John, can you hear me?
    John-->>-Alice: Hi Alice, I can hear you!
    John-->>-Alice: I feel great!`,
  },
  {
    name: "Loops",
    defination: `
    sequenceDiagram
    Alice->John: Hi John, how are you?
    loop Every minute
        John-->Alice: Great!
    end`,
  },
  {
    name: "Alternate Paths",
    defination: `
    sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    alt is sick
        Bob->>Alice: Not so good :(
    else is well
        Bob->>Alice: Feeling fresh like a daisy
    end
    opt Extra response
        Bob->>Alice: Thanks for asking
    end`,
  },
  {
    name: "Critical Regions",
    defination: `
  sequenceDiagram
    critical Establish a connection to the DB
        Service-->DB: connect
    option Network timeout
        Service-->Service: Log error
    option Credentials rejected
        Service-->Service: Log different error
    end`,
  },
  {
    name: "Parallel Actions",
    defination: `sequenceDiagram
    par Alice to Bob
        Alice->>Bob: Hello Folks!
    and Alice to John
        Alice->>John: Hello Folks!
    end
    Bob-->>Alice: Hi Alice!
    John-->>Alice: Hi Alice!`,
  },
  {
    name: "Break",
    defination: `
sequenceDiagram
    Consumer-->API: Book something
    API-->BookingService: Start booking process
    break when the booking process fails
        API-->Consumer: show failure
    end
    API-->BillingService: Start billing process`,
  },
  {
    name: "Comments",
    defination: `
    sequenceDiagram
    Alice->>John: Hi John, whats up?
    %% this is a comment
    John-->>Alice: Great!`,
  },
];

export { SEQUENCE_DIAGRAM_TESTCASES };
