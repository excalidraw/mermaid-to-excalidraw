import type { TestCase } from "../SingleTestCase";

export const CLASS_DIAGRAM_TESTCASES: TestCase[] = [
  {
    type: "class",
    name: "Class only",
    definition: `classDiagram
  class Animal
    `,
  },
  {
    type: "class",
    name: "Class with Relations",
    definition: `classDiagram
  class Animal
  Vehicle <|-- Car`,
  },
  {
    type: "class",
    name: "Class with Labels",
    definition: `classDiagram
  class Animal["Animal with a label"]
  class Car["Car with *! symbols"]
  Animal --> Car`,
  },
  {
    type: "class",
    name: "Class with Members",
    definition: `classDiagram
  class BankAccount
  BankAccount : +String owner
  BankAccount : +Bigdecimal balance
  BankAccount : +deposit(amount)
  BankAccount : +withdrawal(amount)`,
  },
  {
    type: "class",
    name: "Class with Members using Curly braces ({})",
    definition: `classDiagram
  class BankAccount{
    +String owner
    +BigDecimal balance
    +deposit(amount)
    +withdrawal(amount)
  }`,
  },
  {
    type: "class",
    name: "Class with Members and Return type",
    definition: `classDiagram
  class BankAccount{
    +String owner
    +BigDecimal balance
    +deposit(amount) bool
    +withdrawal(amount) int
  }`,
  },
  {
    type: "class",
    name: "Class with Generic types",
    definition: `classDiagram
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
    type: "class",
    name: "Multiple Classes with Members",
    definition: `classDiagram
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
    type: "class",
    name: "Class with Relations [1]",
    definition: `classDiagram
  classA <|-- classB
  classC *-- classD
  classE o-- classF
  classG <-- classH
  `,
  },
  {
    type: "class",
    name: "Class with Relations [2]",
    definition: `classDiagram
  classI -- classJ
  classK <.. classL
  classM <|.. classN
  classO .. classP`,
  },
  {
    type: "class",
    name: "Class with 2 way Relations",
    definition: `classDiagram
  Animal <|--|> Zebra
  Bird o..\* Peacock`,
  },
  {
    type: "class",
    name: "Class with 2 way Relations and direction",
    definition: `classDiagram
    direction RL
    classA <|--|> classB
    classC *--* classD
    classE o--o classF
    classG <--> classH`,
  },
  {
    type: "class",
    name: "Class with Namespace",
    definition: `classDiagram
  namespace BaseShapes {
    class Triangle
    class Rectangle {
      double width
      double height
    }
  }`,
  },
  {
    type: "class",
    name: "Class with Cardinality / Multiplicity on Relations",
    definition: `classDiagram
  Customer "1" --> "*" Ticket
  Student "1" --> "1..*" Course
  Galaxy --> "many" Star : Contains`,
  },
  {
    type: "class",
    name: "Annotations on Classes",
    definition: `classDiagram
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
    type: "class",
    name: "Comments",
    definition: `classDiagram
  %% This whole line is a comment classDiagram class Shape <&lt;interface&gt;>
  class Shape{
    <<interface>>
    noOfVertices
    draw()
  }`,
  },
  {
    type: "class",
    name: "Setting the direction of Diagram -> Left to Right ",
    definition: `classDiagram
  direction LR
  class Student {
    -idCard : IdCard
  }
  class IdCard{
    -id : int
    -name : string
  }
  class Bike{
    -id : int
    -name : string
  }
  Student "1" --o "1" IdCard : carries
  Student "1" --o "1" Bike : rides`,
  },
  {
    type: "class",
    name: "Setting the direction of Diagram -> Right to Left ",
    definition: `classDiagram
  direction RL
  class Student {
    -idCard : IdCard
  }
  class IdCard{
    -id : int
    -name : string
  }
  class Bike{
    -id : int
    -name : string
  }
  Student "1" --o "1" IdCard : carries
  Student "1" --o "1" Bike : rides`,
  },

  {
    type: "class",
    name: "Setting the direction of Diagram -> Bottom to Top ",
    definition: `classDiagram
  direction BT
  class Student {
    -idCard : IdCard
  }
  class IdCard{
    -id : int
    -name : string
  }
  class Bike{
    -id : int
    -name : string
  }
  Student "1" --o "1" IdCard : carries
  Student "1" --o "1" Bike : rides`,
  },
  {
    type: "class",
    name: "Setting the direction of Diagram -> Top to Bottom ",
    definition: `classDiagram
  direction TB
  class Student {
    -idCard : IdCard
  }
  class IdCard{
    -id : int
    -name : string
  }
  class Bike{
    -id : int
    -name : string
  }
  Student "1" --o "1" IdCard : carries
  Student "1" --o "1" Bike : rides`,
  },
  {
    type: "class",
    name: "Class with Notes",
    definition: `classDiagram
  note "This is a general note"
  note for MyClass "This is a note for a class"
  class MyClass{
  }`,
  },
  {
    type: "class",
    name: "Class with Routed Notes and Mixed Arrowheads",
    definition: `classDiagram
  class Vehicle {
    +startEngine() void
    +stopEngine() void
  }

  class Car
  class Motorcycle
  class Engine
  class Driver {
    +drive(Vehicle vehicle) void
  }

  Vehicle <|-- Car : Inheritance
  Vehicle <|-- Motorcycle : Inheritance
  Vehicle *-- Engine : Composition
  Driver o-- Vehicle : Aggregation

  note for Vehicle "Base class for all transport types"
  note for Engine "Internal combustion or electric"

  style Vehicle fill:#f9f,stroke:#333,stroke-width:2px
  style Car fill:#bbf,stroke:#333,stroke-width:1px
  style Motorcycle fill:#bbf,stroke:#333,stroke-width:1px
  style Engine fill:#dfd,stroke:#333,stroke-width:1px
  style Driver fill:#ffd,stroke:#333,stroke-width:1px`,
  },
  {
    type: "class",
    name: "Classes with partial match",
    definition: `classDiagram
    Foobar <|-- Foo
    Baz <|-- Foo
    `,
  },
  {
    type: "class",
    name: "Class with Custom Colors using style",
    definition: `classDiagram
  class Animal
  class Mineral
  style Animal fill:#f9f,stroke:#333,stroke-width:4px
  style Mineral fill:#bbf,stroke:#f66,stroke-width:2px,color:#fff,stroke-dasharray: 5 5`,
  },
  {
    type: "class",
    name: "Styled Class Text Colors",
    definition: `classDiagram
    class User {
        +String username
        +String email
        +login()
        +logout()
    }

    class Profile {
        +String bio
        +String avatarUrl
        +updateProfile()
    }

    class Post {
        +int id
        +String content
        +DateTime createdAt
        +publish()
    }

    class Comment {
        +String text
        +submit()
    }

    User "1" -- "1" Profile : has
    User "1" -- "*" Post : creates
    Post "1" -- "*" Comment : contains
    User "1" -- "*" Comment : writes

    style User fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#01579b
    style Profile fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c
    style Post fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#1b5e20
    style Comment fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100`,
  },
  {
    type: "class",
    name: "self-refrencing Class",
    definition: `classDiagram
    class Snake {
        +Integer length
    }
    Snake "1" -- "1" Snake : eats`,
  },
];
