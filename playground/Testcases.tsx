import { useRef, useEffect } from "react";

import { FLOWCHART_DIAGRAM_TESTCASES } from "./testcases/flowchart";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.ts";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.ts";
import { UNSUPPORTED_DIAGRAM_TESTCASES } from "./testcases/unsupported.ts";

import { Mermaid } from "./Mermaid";
import { useExcalidraw } from "./context/excalidraw.ts";

interface TestCaseProps {
  name: string;
  baseId: string;
  testcases: { name: string; definition: string }[];
}

const Testcase = ({ name, baseId, testcases }: TestCaseProps) => {
  const excalidraw = useExcalidraw();
  const activeTestcase = useRef<number>();

  useEffect(() => {
    const testcase = activeTestcase.current;

    if (testcase !== undefined) {
      const { definition } = testcases[testcase];

      excalidraw.translateMermaidToExcalidraw(definition);
    }
  }, [excalidraw.translateMermaidToExcalidraw, testcases]);

  return (
    <>
      <h2>{`${name} Diagrams`}</h2>
      <details>
        <summary>{`${name} Examples`}</summary>
        <div id={`${baseId}-container`}>
          {testcases.map(({ name, definition }, index) => {
            const id = `${baseId}-${index}`;

            return (
              <div key={id}>
                <h2 style={{ marginTop: "50px", color: "#f06595" }}>{name}</h2>

                <pre
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    fontStyle: "italic",
                    background: "#eeeef1",
                    whiteSpace: "pre-wrap",
                    width: "45vw",
                    padding: "5px",
                  }}
                >
                  {definition}
                </pre>

                <button
                  onClick={() => {
                    excalidraw.translateMermaidToExcalidraw(definition);
                    activeTestcase.current = index;
                  }}
                >
                  {"Render to Excalidraw"}
                </button>

                <Mermaid definition={definition} id={id} />
              </div>
            );
          })}
        </div>
      </details>
    </>
  );
};

const Testcases = () => {
  return (
    <>
      <Testcase
        name="Flowchart"
        baseId="flowchart"
        testcases={FLOWCHART_DIAGRAM_TESTCASES}
      />

      <Testcase
        name="Sequence"
        baseId="sequence"
        testcases={SEQUENCE_DIAGRAM_TESTCASES}
      />

      <Testcase
        name="Class"
        baseId="class"
        testcases={CLASS_DIAGRAM_TESTCASES}
      />

      <Testcase
        name="Unsupported"
        baseId="unsupported"
        testcases={UNSUPPORTED_DIAGRAM_TESTCASES}
      />
    </>
  );
};

export default Testcases;