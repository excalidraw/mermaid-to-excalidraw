import { useState } from "react";
import { parseMermaid } from "../src/parseMermaid.ts";
import { Mermaid } from "./Mermaid.tsx";

interface CustomTestProps {
  mermaid: {
    syntax: string;
    data: Awaited<ReturnType<typeof parseMermaid>> | null;
    error: unknown;
  };
  onChangeDefinition: (definition: string) => void;
}

const CustomTest = ({ onChangeDefinition, mermaid }: CustomTestProps) => {
  const isActiveCustomTest = window.location.hash === "#custom-diagram";
  return (
    <>
      <textarea
        id="mermaid-input"
        rows={10}
        cols={50}
        name="mermaid-input"
        onChange={(e) => {
          onChangeDefinition(e.target.value);

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
          <Mermaid definition={mermaid.syntax} id="custom-diagram" />

          <details id="parsed-data-details">
            <summary>{"Parsed data from parseMermaid"}</summary>
            <pre id="custom-parsed-data">
              {JSON.stringify(mermaid.data, null, 2)}
            </pre>
          </details>

          {typeof mermaid.error === "string" && (
            <div id="error">{mermaid.error}</div>
          )}
        </>
      )}
    </>
  );
};

export default CustomTest;
