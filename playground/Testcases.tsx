import { Fragment } from "react";

import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import SingleTestCase, { TestCase } from "./SingleTestCase.tsx";
import type { ActiveTestCaseIndex, MermaidData } from "./index.tsx";

interface TestcasesProps {
  onChange: (
    definition: MermaidData["definition"],
    activeTestCaseIndex: number | "custom" | null
  ) => void;
  activeTestCaseIndex: ActiveTestCaseIndex;
}

const Testcases = ({ onChange }: TestcasesProps) => {
  const testcaseTypes: { name: string; testcases: TestCase[] }[] = [
    { name: "Flowchart", testcases: FLOWCHART_DIAGRAM_TESTCASES },
    { name: "Sequence", testcases: SEQUENCE_DIAGRAM_TESTCASES },
    { name: "Class", testcases: CLASS_DIAGRAM_TESTCASES },
    { name: "Unsupported", testcases: UNSUPPORTED_DIAGRAM_TESTCASES },
  ];

  const allTestCases = testcaseTypes.flatMap((type) => type.testcases);

  let testCaseIndex = 0;
  return (
    <>
      {testcaseTypes.map(({ name, testcases }) => {
        const baseId = name.toLowerCase();
        return (
          <Fragment key={baseId}>
            <h2>
              {name} {"Diagrams"}
            </h2>
            <details>
              <summary>
                {name} {"Diagram Examples"}
              </summary>
              <div id={`${baseId}-container`} className="testcase-container">
                {testcases.map((testcase, index) => {
                  return (
                    <SingleTestCase
                      key={`${testcase.type}-${index}`}
                      index={testCaseIndex++}
                      onChange={(index) => {
                        const { definition } = allTestCases[index];
                        onChange(definition, index);
                      }}
                      testcase={testcase}
                    />
                  );
                })}
              </div>
            </details>
          </Fragment>
        );
      })}
    </>
  );
};

export default Testcases;
