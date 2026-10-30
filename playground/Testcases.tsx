import {
  testcasesOfType,
  type TestCase,
  type TestCaseType,
} from "../testcases/testcases.ts";
import SingleTestCase from "./SingleTestCase.tsx";
import type { ActiveTestCaseIndex, MermaidData } from "./index.tsx";
import { usePersistedSectionState } from "./usePersistedSectionState.ts";

interface TestcasesProps {
  onChange: (
    definition: MermaidData["definition"],
    activeTestCaseIndex: number | "custom" | null
  ) => void;
  onInsertMermaidSvg: (svgHtml: string, width: number, height: number) => void;
  activeTestCaseIndex: ActiveTestCaseIndex;
}

interface TestcaseSectionProps {
  name: string;
  testcases: TestCase[];
  startIndex: number;
  documentationHref: string;
  onChange: TestcasesProps["onChange"];
  onInsertMermaidSvg: TestcasesProps["onInsertMermaidSvg"];
}

const TestcaseSection = ({
  name,
  testcases,
  startIndex,
  documentationHref,
  onChange,
  onInsertMermaidSvg,
}: TestcaseSectionProps) => {
  const baseId = name.toLowerCase();
  const { isExpanded, handleToggle } = usePersistedSectionState(
    `testcases:${baseId}`,
    name === "Class"
  );

  return (
    <details
      key={baseId}
      className="testcase-section"
      open={isExpanded}
      onToggle={handleToggle}
    >
      <summary>
        <span className="details-summary-text">
          {name} {"Diagram Examples"}
        </span>
        <span className="details-summary-actions">
          <a
            className="details-summary-link"
            href={documentationHref}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              window.open(documentationHref, "_blank", "noopener,noreferrer");
            }}
          >
            {"Docs"}
          </a>
          <span className="details-summary-meta">{testcases.length}</span>
        </span>
      </summary>
      {isExpanded ? (
        <div id={`${baseId}-container`} className="testcase-container">
          {testcases.map((testcase, index) => {
            const testcaseIndex = startIndex + index;

            return (
              <SingleTestCase
                key={testcase.id}
                onChange={(definition) => {
                  onChange(definition, testcaseIndex);
                }}
                onInsertMermaidSvg={onInsertMermaidSvg}
                testcase={testcase}
              />
            );
          })}
        </div>
      ) : null}
    </details>
  );
};

// one per test case type, in the order of TESTCASES (which the indexes count in)
const SECTIONS: {
  type: TestCaseType;
  name: string;
  documentationHref: string;
}[] = [
  {
    type: "flowchart",
    name: "Flowchart",
    documentationHref: "https://mermaid.js.org/syntax/flowchart.html",
  },
  {
    type: "sequence",
    name: "Sequence",
    documentationHref: "https://mermaid.js.org/syntax/sequenceDiagram.html",
  },
  {
    type: "class",
    name: "Class",
    documentationHref: "https://mermaid.js.org/syntax/classDiagram.html",
  },
  {
    type: "erd",
    name: "ERD",
    documentationHref:
      "https://mermaid.js.org/syntax/entityRelationshipDiagram.html",
  },
  {
    type: "state",
    name: "State",
    documentationHref: "https://mermaid.js.org/syntax/stateDiagram.html",
  },
  {
    type: "unsupported",
    name: "Unsupported",
    documentationHref: "https://mermaid.js.org/intro/syntax-reference.html",
  },
  {
    type: "swimlane",
    name: "Swimlane (Pele only)",
    documentationHref: "https://pele.run",
  },
];

const Testcases = ({ onChange, onInsertMermaidSvg }: TestcasesProps) => {
  const testcaseTypes = SECTIONS.map(({ type, ...section }) => ({
    ...section,
    testcases: testcasesOfType(type),
  })).map((section, index, sections) => ({
    ...section,
    startIndex: sections
      .slice(0, index)
      .reduce((total, current) => total + current.testcases.length, 0),
  }));

  return (
    <>
      {testcaseTypes.map(
        ({ name, testcases, documentationHref, startIndex }) => {
          return (
            <TestcaseSection
              key={name}
              documentationHref={documentationHref}
              name={name}
              onChange={onChange}
              onInsertMermaidSvg={onInsertMermaidSvg}
              startIndex={startIndex}
              testcases={testcases}
            />
          );
        }
      )}
    </>
  );
};

export default Testcases;
