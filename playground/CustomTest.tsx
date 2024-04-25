import { Mermaid } from "./Mermaid.tsx";
import type { MermaidData } from "./index.tsx";

const CustomTest = ({
  onChange,
  mermaidData,
}: {
  onChange: (definition: string) => void;
  mermaidData: MermaidData;
}) => {
  const isActiveCustomTest = window.location.hash === "#custom-diagram";
  return (
    <>
      <textarea
        id="mermaid-input"
        rows={10}
        cols={50}
        name="mermaid-input"
        onChange={(e) => {
          onChange(e.target.value);

          window.location.hash = "#custom-diagram";
        }}
        style={{ marginTop: "1rem" }}
        placeholder="Input Mermaid Syntax"
      />
      <br />
      <button type="button" onClick={() => {}} id="render-excalidraw-btn">
        {"Render to Excalidraw"}
      </button>

      {isActiveCustomTest && (
        <>
          <Mermaid definition={mermaidData.syntax} id="custom-diagram" />

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
