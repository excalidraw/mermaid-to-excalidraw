import { useRef, useEffect, Fragment } from "react";

import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import { Mermaid } from "./Mermaid";

interface TestCaseProps {
  name: string;
  testcases: { name: string; definition: string }[];
  onChange: (definition: string) => void;
}

const Testcase = ({ name, testcases, onChange }: TestCaseProps) => {
  const activeTestcase = useRef<number>();
  const baseId = name.toLowerCase();

  useEffect(() => {
    const testcase = activeTestcase.current;

    if (testcase !== undefined) {
      const { definition } = testcases[testcase];

      onChange(definition);
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
                    onChange(definition);
                    window.location.hash = "";
                    activeTestcase.current = index;
                  }}
                >
                  {"Render to Excalidraw"}
                </button>
                <Mermaid definition={definition} id={id} />
              </Fragment>
            );
          })}
        </div>
      </details>
    </>
  );
};

interface TestcasesProps {
  onChange: (definition: string) => void;
}

const Testcases = ({ onChange }: TestcasesProps) => {
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
          onChange={onChange}
          testcases={testcases}
        />
      ))}
    </>
  );
};

export default Testcases;
