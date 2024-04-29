import { Fragment } from "react";
import { MermaidDiagram } from "./MermaidDiagram";

export interface SingleTestCaseProps {
  name: string;
  testcases: { name: string; definition: string }[];
  onChange: (activeTestcaseIndex: number) => void;
  activeTestcaseIndex?: number;
}

const SingleTestCase = ({ name, testcases, onChange }: SingleTestCaseProps) => {
  const baseId = name.toLowerCase();

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
                    onChange(index);
                  }}
                >
                  {"Render to Excalidraw"}
                </button>

                <MermaidDiagram
                  key={definition}
                  definition={definition}
                  id={id}
                />
              </Fragment>
            );
          })}
        </div>
      </details>
    </>
  );
};

export default SingleTestCase;
