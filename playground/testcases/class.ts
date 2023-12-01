export const CLASS_DIAGRAM_TESTCASES = [
  {
    name: "Class only",
    defination: `classDiagram
  class Animal
    `,
  },
  {
    name: "Class with relation",
    defination: `classDiagram
  class Animal
  Vehicle <|-- Car`,
  },
  {
    name: "Class with Labels",
    defination: `classDiagram
  class Animal["Animal with a label"]
  class Car["Car with *! symbols"]
  Animal --> Car`,
  },
  {
    name: "Class with Members",
    defination: `classDiagram
  class BankAccount
  BankAccount : +String owner
  BankAccount : +Bigdecimal balance
  BankAccount : +deposit(amount)
  BankAccount : +withdrawal(amount)`,
  },
  {
    name: "Class with Members using Curly braces ({})",
    defination: `classDiagram
  class BankAccount{
    +String owner
    +BigDecimal balance
    +deposit(amount)
    +withdrawal(amount)
  }`,
  },
  {
    name: "Class with Members and Return type",
    defination: `classDiagram
  class BankAccount{
    +String owner
    +BigDecimal balance
    +deposit(amount) bool
    +withdrawal(amount) int
  }`,
  },
  {
    name: "Class with Generic types",
    defination: `classDiagram
    class Square~Shape~{
        int id
        List~int~ position
        setPoints(List~int~ points)
        getPoints() List~int~
    }
    
    Square : -List~string~ messages
    Square : +setMessages(List~string~ messages)
    Square : +getMessages() List~string~
    Square : +getDistanceMatrix() List~List~int~~`,
  },
  {
    name: "Multiple Classes with Members",
    defination: `classDiagram
  class Duck
  Duck : +String beakColor
  Duck : +swim()
  class Fish
  Fish : -int sizeInFeet
  Fish : +canEat()
  class Zebra
  Zebra : +bool is_wild
  Zebra : +run()
  `,
  },
  {
    name: "Class with Relations [1]",
    defination: `classDiagram
  classA <|-- classB
  classC *-- classD
  classE o-- classF
  classG <-- classH
  `,
  },
  {
    name: "Class with Relations [2]",
    defination: `classDiagram
  classI -- classJ
  classK <.. classL
  classM <|.. classN
  classO .. classP`,
  },
  {
    name: "Class with 2 way Relations",
    defination: `classDiagram
  Animal <|--|> Zebra
  Bird o..\* Peacock`,
  },
  {
    name: "Class with Namespace",
    defination: `classDiagram
  namespace BaseShapes {
    class Triangle
    class Rectangle {
      double width
      double height
    }
  }`,
  },
  {
    name: "Class with Cardinality / Multiplicity on Relations",
    defination: `classDiagram
  Customer "1" --> "*" Ticket
  Student "1" --> "1..*" Course
  Galaxy --> "many" Star : Contains`,
  },
  {
    name: "Annotations on Classes",
    defination: `classDiagram
  class Shape{
    <<interface>>
    noOfVertices
    draw()
  }
  class Color{
    <<enumeration>>
    RED
    BLUE
    GREEN
    WHITE
    BLACK
  }`,
  },
  {
    name: "Comments",
    defination: `classDiagram
    %% This whole line is a comment classDiagram class Shape <<interface>>
    class Shape{
      <<interface>>
      noOfVertices
      draw()
    }`,
  },
];
