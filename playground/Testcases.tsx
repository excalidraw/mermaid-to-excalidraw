import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { ERD_DIAGRAM_TESTCASES } from "./testcases/er.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import SingleTestCase, { TestCase } from "./SingleTestCase.tsx";
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
                key={`${testcase.type}-${index}`}
                index={testcaseIndex}
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

const Testcases = ({ onChange, onInsertMermaidSvg }: TestcasesProps) => {
  const testcaseTypes: {
    name: string;
    testcases: TestCase[];
    documentationHref: string;
    startIndex: number;
  }[] = [
    {
      name: "Flowchart",
      testcases: FLOWCHART_DIAGRAM_TESTCASES,
      documentationHref: "https://mermaid.js.org/syntax/flowchart.html",
    },
    {
      name: "Sequence",
      testcases: SEQUENCE_DIAGRAM_TESTCASES,
      documentationHref: "https://mermaid.js.org/syntax/sequenceDiagram.html",
    },
    {
      name: "Class",
      testcases: CLASS_DIAGRAM_TESTCASES,
      documentationHref: "https://mermaid.js.org/syntax/classDiagram.html",
    },
    {
      name: "ERD",
      testcases: ERD_DIAGRAM_TESTCASES,
      documentationHref:
        "https://mermaid.js.org/syntax/entityRelationshipDiagram.html",
    },
    {
      name: "Unsupported",
      testcases: UNSUPPORTED_DIAGRAM_TESTCASES,
      documentationHref: "https://mermaid.js.org/intro/syntax-reference.html",
    },
  ].map((section, index, sections) => ({
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
