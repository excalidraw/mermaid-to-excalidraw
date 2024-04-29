import { Fragment, useEffect } from "react";
import { MermaidDiagram } from "./MermaidDiagram";

export interface SingleTestCaseProps {
  name: string;
  testcases: { name: string; definition: string }[];
  onChange: (definition: string, activeTestcaseIndex: number) => void;
  activeTestcaseIndex?: number;
}

const SingleTestCase = ({
  name,
  testcases,
  onChange,
  activeTestcaseIndex,
}: SingleTestCaseProps) => {
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
              </Fragment>
            );
          })}
        </div>
      </details>
    </>
  );
};

export default SingleTestCase;
