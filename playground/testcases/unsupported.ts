import type { TestCase } from "../SingleTestCase";

export const UNSUPPORTED_DIAGRAM_TESTCASES: TestCase[] = [
  {
    type: "unsupported",
    name: "ER Diagram",
    definition: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
  },
  {
    type: "unsupported",
    name: "Gantt Diagram",
    definition: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d`,
  },
];
