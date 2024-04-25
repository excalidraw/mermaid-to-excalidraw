import { MermaidDiagram } from "./MermaidDiagram.tsx";
import type { MermaidData } from "./index.tsx";

interface CustomTestProps {
  onChange: (definition: string, isCustom?: boolean) => void;
  mermaidData: MermaidData;
  isActive: boolean;
}

const CustomTest = ({ onChange, mermaidData, isActive }: CustomTestProps) => {
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.target as HTMLFormElement);

          onChange(formData.get("mermaid-input")?.toString() || "", true);
        }}
      >
        <textarea
          id="mermaid-input"
          rows={10}
          cols={50}
          name="mermaid-input"
          onChange={(e) => {
            if (!isActive) {
              return;
            }

            onChange(e.target.value, true);
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
          </details>

          {typeof mermaidData.error === "string" && (
            <div id="error">{mermaidData.error}</div>
          )}
        </>
      )}
    </>
  );
};

export default CustomTest;
