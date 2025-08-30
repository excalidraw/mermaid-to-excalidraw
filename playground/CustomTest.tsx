import { MermaidDiagram } from "./MermaidDiagram.tsx";
import type { ActiveTestCaseIndex, MermaidData } from "./index.tsx";

interface CustomTestProps {
  onChange: (
    definition: MermaidData["definition"],
    activeTestCaseIndex: ActiveTestCaseIndex
  ) => void;
  mermaidData: MermaidData;
  activeTestCaseIndex: ActiveTestCaseIndex;
}

const CustomTest = ({
  onChange,
  mermaidData,
  activeTestCaseIndex,
}: CustomTestProps) => {
  const isActive = activeTestCaseIndex === "custom";
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.target as HTMLFormElement);

          onChange(formData.get("mermaid-input")?.toString() || "", "custom");
        }}
      >
        <textarea
          id="mermaid-input"
          rows={10}
          cols={50}
          name="mermaid-input"
          value={mermaidData.definition}
          onChange={(e) => {
            if (!isActive) {
              return;
            }

            onChange(e.target.value, "custom");
          }}
          style={{ marginTop: "1rem" }}
          placeholder="Input Mermaid Syntax"
        />
        <br />
        <button type="submit" id="render-excalidraw-btn">
          {"Render to Excalidraw"}
        </button>
      </form>

      {isActive && (
        <>
          <MermaidDiagram
            definition={mermaidData.definition}
            id="custom-diagram"
          />

          <details id="parsed-data-details">
            <summary>{"Parsed data from parseMermaid"}</summary>
            <pre id="custom-parsed-data">
              {JSON.stringify(mermaidData.output, null, 2)}
            </pre>
            {mermaidData.error && <div id="error">{mermaidData.error}</div>}
          </details>
        </>
      )}
    </>
  );
};

export default CustomTest;
