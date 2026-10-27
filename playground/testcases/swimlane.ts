import type { TestCase } from "../SingleTestCase";

// `swimlane-beta`: flowcharts in lanes (Pele only)
export const SWIMLANE_DIAGRAM_TESTCASES: TestCase[] = [
  {
    type: "swimlane",
    name: "Swimlanes left to right",
    definition: `swimlane-beta LR
  subgraph Customer
    Start[Start]
    Browse[Browse Catalog]
    Cart[Add to Cart]
    Checkout[Proceed to Checkout]
    Pay[Make Payment]
    Receive[Receive Order]
  end
  subgraph Sales
    Order[Create Order]
    Invoice[Generate Invoice]
  end
  subgraph Warehouse
    Check[Check Inventory]
    Pack[Pack Items]
    Ship[Ship Package]
  end
  Start --> Browse
  Browse --> Cart
  Cart --> Checkout
  Checkout --> Order
  Order --> Invoice
  Invoice --> Pay
  Order --> Check
  Check --> Pack
  Pack --> Ship
  Ship --> Receive`,
  },
  {
    type: "swimlane",
    name: "Swimlanes top to bottom, with titles",
    definition: `swimlane-beta TB
  subgraph Customer [Customer and their very long role description]
    A[Start] --> B[Browse]
  end
  subgraph Sales [Sales team]
    C{Approve?}
  end
  subgraph Warehouse
    D[Ship]
  end
  B --> C
  C -->|yes| D
  C -->|no| A`,
  },
];
