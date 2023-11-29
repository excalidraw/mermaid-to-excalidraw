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
    name: "Class with labels",
    defination: `classDiagram
  class Animal["Animal with a label"]
  class Car["Car with *! symbols"]
  Animal --> Car`,
  },
  {
    name: "Class with members",
    defination: `classDiagram
  class BankAccount
  BankAccount : +String owner
  BankAccount : +Bigdecimal balance
  BankAccount : +deposit(amount)
  BankAccount : +withdrawal(amount)`,
  },
  {
    name: "Class with members using curly braces ({})",
    defination: `classDiagram
  class BankAccount{
    +String owner
    +BigDecimal balance
    +deposit(amount) bool
    +withdrawal(amount) int
  }`,
  },
  {
    name: "Class with members and return type",
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
    name: "Multiple Classes with members",
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
];
