import { MermaidDiagram } from "./MermaidDiagram";

export interface TestCase {
  type: "class" | "flowchart" | "sequence" | "unsupported";
  name: string;
  definition: string;
}

export interface SingleTestCaseProps {
  testcase: TestCase;
  onChange: (activeTestcaseIndex: number) => void;
  index: number;
  activeTestcaseIndex?: number;
}

const SingleTestCase = ({ testcase, onChange, index }: SingleTestCaseProps) => {
  const { name, definition, type } = testcase;
  return (
    <>
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
        id={`${type}-${index}`}
      />
    </>
  );
};

export default SingleTestCase;
