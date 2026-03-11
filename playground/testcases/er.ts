import type { TestCase } from "../SingleTestCase";

export const ERD_DIAGRAM_TESTCASES: TestCase[] = [
  {
    type: "erd",
    name: "Single Entity",
    definition: `erDiagram
  "This ❤ Unicode"`,
  },
  {
    type: "erd",
    name: "Basic Cardinalities",
    definition: `erDiagram
  PROPERTY ||--|{ ROOM : contains`,
  },
  {
    type: "erd",
    name: "Self Relationship",
    definition: `erDiagram
  CATEGORY ||--o{ CATEGORY : parent_of
  CATEGORY {
    integer id PK
    integer parent_id FK
    string display_name
  }`,
  },
  {
    type: "erd",
    name: "Identifying and Non-Identifying Relationships",
    definition: `erDiagram
  CAR ||--o{ NAMED-DRIVER : allows
  PERSON }o..o{ NAMED-DRIVER : is`,
  },
  {
    type: "erd",
    name: "Entity Aliases",
    definition: `erDiagram
  p[Person] {
    string firstName
    string lastName
  }
  a["Customer Account"] {
    string email
  }
  p ||--o| a : has`,
  },
  {
    type: "erd",
    name: "Attributes with Keys and Comments",
    definition: `erDiagram
  CAR ||--o{ NAMED-DRIVER : allows
  CAR {
    string registrationNumber PK
    string make
    string model
    string[] parts
  }
  PERSON ||--o{ NAMED-DRIVER : is
  PERSON {
    string driversLicense PK "The license #"
    string(99) firstName "Only 99 characters are allowed"
    string lastName
    string phone UK
    int age
  }
  NAMED-DRIVER {
    string carRegistrationNumber PK, FK
    string driverLicence PK, FK
  }
  MANUFACTURER only one to zero or more CAR : makes`,
  },
  {
    type: "erd",
    name: "Direction Left to Right",
    definition: `erDiagram
  direction LR
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER {
    string name
    string custNumber
    string sector
  }
  ORDER ||--|{ LINE-ITEM : contains
  ORDER {
    int orderNumber
    string deliveryAddress
  }
  LINE-ITEM {
    string productCode
    int quantity
    float pricePerUnit
  }`,
  },
  {
    type: "erd",
    name: "Class Styling",
    definition: `erDiagram
  CAR {
    string registrationNumber
    string make
    string model
  }
  PERSON {
    string firstName
    string lastName
    int age
  }
  PERSON:::foo ||--|| CAR : owns
  PERSON o{--|| HOUSE:::bar : has
  classDef default fill:#f9f,stroke-width:4px
  classDef foo stroke:#f00
  classDef bar stroke:#0f0`,
  },
];
