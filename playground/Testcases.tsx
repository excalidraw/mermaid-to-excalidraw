import { useRef, useEffect, Fragment } from "react";

import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import type { UpdateMermaidDefinition } from "./index.tsx";
import { MermaidDiagram } from "./MermaidDiagram.tsx";

interface TestCaseProps {
  name: string;
  testcases: { name: string; definition: string }[];
  onChange: (definition: string, activeTestcaseIndex: number) => void;
  error: string | null;
  activeTestcaseIndex?: number;
}

const Testcase = ({
  name,
  testcases,
  onChange,
  error,
  activeTestcaseIndex,
}: TestCaseProps) => {
  const baseId = name.toLowerCase();

  useEffect(() => {
    if (activeTestcaseIndex !== undefined) {
      const { definition } = testcases[activeTestcaseIndex];

      onChange(definition, activeTestcaseIndex);
    }
  }, [testcases]);

  return (
    <>
      <h2>
        {name} {"Diagrams"}
      </h2>
      <details>
        <summary>
          {name} {"Examples"}
        </summary>
        <div id={`${baseId}-container`} className="testcase-container">
          {testcases.map(({ name, definition }, index) => {
            const id = `${baseId}-${index}`;
            return (
              <Fragment key={id}>
                <h2 style={{ marginTop: "50px", color: "#f06595" }}>{name}</h2>
                <pre>{definition}</pre>
                <button
                  onClick={() => {
                    onChange(definition, index);
                  }}
                >
                  {"Render to Excalidraw"}
                </button>

                <MermaidDiagram definition={definition} id={id} />

                {error && activeTestcaseIndex === index && (
                  <div id="error">{error}</div>
                )}
              </Fragment>
            );
          })}
        </div>
      </details>
    </>
  );
};

interface TestcasesProps {
  onChange: UpdateMermaidDefinition;
  isCustomTest: boolean;
  error: TestCaseProps["error"];
}

const Testcases = ({ onChange, error, isCustomTest }: TestcasesProps) => {
  const activeTestcase = useRef<[number, number]>();

  const testCases = [
    { name: "Flowchart", testcases: FLOWCHART_DIAGRAM_TESTCASES },
    { name: "Sequence", testcases: SEQUENCE_DIAGRAM_TESTCASES },
    { name: "Class", testcases: CLASS_DIAGRAM_TESTCASES },
    { name: "Unsupported", testcases: UNSUPPORTED_DIAGRAM_TESTCASES },
  ];

  return (
    <>
      {testCases.map(({ name, testcases }, index) => (
        <Testcase
          key={index}
          name={name}
          activeTestcaseIndex={
            activeTestcase.current?.[0] === index
              ? activeTestcase.current[1]
              : undefined
          }
          onChange={(definition, activeTestcaseIndex) => {
            activeTestcase.current = [index, activeTestcaseIndex];

            onChange(definition, false);
          }}
          testcases={testcases}
          error={!isCustomTest ? error : null}
        />
      ))}
    </>
  );
};

export default Testcases;
