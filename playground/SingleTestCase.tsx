import { useEffect, useRef, useState } from "react";
import { MermaidDiagram } from "./MermaidDiagram";
import { ExcalidrawSvgPreview } from "./ExcalidrawSvgPreview";

export interface TestCase {
  type: "class" | "flowchart" | "sequence" | "unsupported";
  name: string;
  definition: string;
}

export interface SingleTestCaseProps {
  testcase: TestCase;
  onChange: () => void;
  index: number;
  activeTestcaseIndex?: number;
}

type CopyState = "idle" | "copied" | "error";

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const didCopy = document.execCommand("copy");
  textarea.remove();

  if (!didCopy) {
    throw new Error("Clipboard copy failed");
  }
};

const SingleTestCase = ({ testcase, onChange, index }: SingleTestCaseProps) => {
  const { name, definition, type } = testcase;
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetCopyStateTimeoutRef = useRef<number | null>(null);
  const testcaseTypeLabel = `${type[0].toUpperCase()}${type.slice(1)} example`;

  useEffect(() => {
    return () => {
      if (resetCopyStateTimeoutRef.current !== null) {
        window.clearTimeout(resetCopyStateTimeoutRef.current);
      }
    };
  }, []);

  const copyButtonLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "error"
      ? "Retry"
      : "Copy";

  return (
    <article className="testcase-card">
      <div className="testcase-card-header">
        <div>
          <p className="testcase-type">{testcaseTypeLabel}</p>
          <h3 className="testcase-name">{name}</h3>
        </div>
      </div>
      <div className="testcase-codeblock">
        <div className="testcase-codeblock-actions">
          <button
            type="button"
            className="render-testcase-button testcase-codeblock-button playground-button"
            onClick={() => {
              onChange();
            }}
          >
            {"Render to Excalidraw"}
          </button>
          <button
            type="button"
            className="copy-mermaid-button testcase-codeblock-button playground-button"
            onClick={async () => {
              try {
                await copyToClipboard(definition);
                setCopyState("copied");
              } catch (error) {
                console.error("Failed to copy Mermaid definition:", error);
                setCopyState("error");
              }

              if (resetCopyStateTimeoutRef.current !== null) {
                window.clearTimeout(resetCopyStateTimeoutRef.current);
              }

              resetCopyStateTimeoutRef.current = window.setTimeout(() => {
                setCopyState("idle");
                resetCopyStateTimeoutRef.current = null;
              }, 1500);
            }}
            title="Copy Mermaid to clipboard"
            aria-label={`Copy Mermaid definition for ${name}`}
          >
            {copyButtonLabel}
          </button>
        </div>
        <pre>{definition}</pre>
      </div>

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
    </article>
  );
};

export default SingleTestCase;
