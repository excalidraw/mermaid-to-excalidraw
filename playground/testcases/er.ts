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
  {
    type: "erd",
    name: "Styled ERD Text Colors",
    definition: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : included-in
    CATEGORY ||--o{ PRODUCT : categorizes

    CUSTOMER {
        int customer_id PK
        string first_name
        string last_name
        string email
        string phone
    }
    ORDER {
        int order_id PK
        int customer_id FK
        datetime order_date
        string status
        decimal total_amount
    }
    LINE-ITEM {
        int line_item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    PRODUCT {
        int product_id PK
        string name
        string sku
        decimal price
        int stock_quantity
    }
    CATEGORY {
        int category_id PK
        string name
        string description
    }

    style CUSTOMER fill:#2d3436,stroke:#00cec9,stroke-width:2px,color:#00cec9
    style ORDER fill:#2d3436,stroke:#0984e3,stroke-width:2px,color:#0984e3
    style LINE-ITEM fill:#2d3436,stroke:#6c5ce7,stroke-width:2px,color:#6c5ce7
    style PRODUCT fill:#2d3436,stroke:#e17055,stroke-width:2px,color:#e17055
    style CATEGORY fill:#2d3436,stroke:#fdcb6e,stroke-width:2px,color:#fdcb6e`,
  },
];
