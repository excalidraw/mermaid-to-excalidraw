import { useState, useEffect } from "react";
import { MermaidDiagram } from "./MermaidDiagram.tsx";
import type { ActiveTestCaseIndex, MermaidData } from "./index.tsx";
import { usePersistedSectionState } from "./usePersistedSectionState.ts";

interface CustomTestProps {
  onChange: (
    definition: MermaidData["definition"],
    activeTestCaseIndex: ActiveTestCaseIndex
  ) => void;
  mermaidData: MermaidData;
  activeTestCaseIndex: ActiveTestCaseIndex;
}

const STORAGE_KEY = "mermaid-to-excalidraw-definition";

const CustomTest = ({
  onChange,
  mermaidData,
  activeTestCaseIndex,
}: CustomTestProps) => {
  const isActive = activeTestCaseIndex === "custom";
  const {
    isExpanded: isParsedDataExpanded,
    handleToggle: handleParsedDataToggle,
  } = usePersistedSectionState("custom:parsed-data");
  const [textareaValue, setTextareaValue] = useState(() => {
    // Load from localStorage on initial mount
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  // Update textarea when mermaidData changes from external source
  useEffect(() => {
    if (mermaidData.definition && activeTestCaseIndex !== "custom") {
      setTextareaValue(mermaidData.definition);
    }
  }, [mermaidData.definition, activeTestCaseIndex]);

  return (
    <>
      <form
        className="custom-test-form"
        onSubmit={(e) => {
          e.preventDefault();

          const formData = new FormData(e.target as HTMLFormElement);
          const definition = formData.get("mermaid-input")?.toString() || "";

          // Save to localStorage
          try {
            localStorage.setItem(STORAGE_KEY, definition);
          } catch (error) {
            console.error("Failed to save to localStorage:", error);
          }

          onChange(definition, "custom");
        }}
      >
        <label className="field-label" htmlFor="mermaid-input">
          {"Mermaid definition"}
        </label>
        <textarea
          id="mermaid-input"
          rows={10}
          cols={50}
          name="mermaid-input"
          value={textareaValue}
          onChange={(e) => {
            const value = e.target.value;
            setTextareaValue(value);

            if (!isActive) {
              return;
            }

            onChange(value, "custom");
          }}
          placeholder="Paste or type Mermaid syntax here"
        />
        <div className="custom-test-actions">
          <button
            className="playground-button"
            type="submit"
            id="render-excalidraw-btn"
          >
            {"Render to Excalidraw"}
          </button>
          <p className="custom-test-hint">
            {"The live Excalidraw canvas updates on the right."}
          </p>
        </div>
      </form>

      {isActive && (
        <>
          <section className="custom-preview-card">
            <div className="preview-badge">{"Live Mermaid SVG"}</div>
            <div className="diagram-preview-surface custom-diagram-surface">
              <MermaidDiagram definition={textareaValue} id="custom-diagram" />
            </div>
          </section>

          <details
            id="parsed-data-details"
            open={isParsedDataExpanded}
            onToggle={handleParsedDataToggle}
          >
            <summary>{"Parsed data from parseMermaid"}</summary>
            {isParsedDataExpanded ? (
              <>
                <pre id="custom-parsed-data">
                  {JSON.stringify(mermaidData.output, null, 2)}
                </pre>
                {mermaidData.error && <div id="error">{mermaidData.error}</div>}
              </>
            ) : null}
          </details>
        </>
      )}
    </>
  );
};

export default CustomTest;
