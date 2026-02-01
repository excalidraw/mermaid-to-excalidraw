import type { TestCase } from "../SingleTestCase";

export const ER_TESTCASES: TestCase[] = [
    {
        type: "er",
        name: "Basic ER Diagram",
        definition: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
    },
    {
        type: "er",
        name: "ER Diagram with Attributes",
        definition: `erDiagram
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    CUSTOMER ||--o{ ORDER : places`,
    },
    {
        type: "er",
        name: "Complex ER Diagram",
        definition: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        string name PK
        string email
    }
    ORDER ||--|{ LINE-ITEM : contains
    ORDER {
        int id PK
        date orderDate
        string status
    }
    LINE-ITEM {
        string productCode FK
        int quantity
        float price
    }
    PRODUCT ||--o{ LINE-ITEM : "ordered in"
    PRODUCT {
        string code PK
        string name
        float price
    }`,
    },
];
