import { MermaidDiagram } from "./MermaidDiagram";
import { ExcalidrawSvgPreview } from "./ExcalidrawSvgPreview";

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

      <div className="diagram-preview-grid">
        <section className="diagram-preview-panel">
          <h3 className="diagram-preview-title">{"Mermaid SVG"}</h3>
          <div className="diagram-preview-surface">
            <MermaidDiagram
              key={definition}
              definition={definition}
              id={`${type}-${index}`}
            />
          </div>
        </section>

        <section className="diagram-preview-panel">
          <h3 className="diagram-preview-title">{"Excalidraw SVG"}</h3>
          <div className="diagram-preview-surface">
            <ExcalidrawSvgPreview definition={definition} />
          </div>
        </section>
      </div>
    </>
  );
};

export default SingleTestCase;
