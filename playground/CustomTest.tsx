import React from "react";

import { Mermaid } from "./Mermaid.tsx";
import { useExcalidraw } from "./context/excalidraw.ts";

function CustomTest() {
  const excalidraw = useExcalidraw();
  const [parsedMermaid, setParsedMermaid] = React.useState<{
    data: string | null;
    error: string | null;
    definition: string | null;
  }>({
    data: null,
    error: null,
    definition: null,
  });

  return (
    <>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          const data = new FormData(event.target as HTMLFormElement);
          const mermaidSyntax = data.get("mermaid-input") as string;

          if (!mermaidSyntax) {
            return;
          }

          try {
            setParsedMermaid({
              data: null,
              definition: null,
              error: null,
            });

            const { mermaid } = await excalidraw.translateMermaidToExcalidraw(
              mermaidSyntax
            );

            setParsedMermaid({
              data: JSON.stringify(mermaid, null, 2),
              definition: mermaidSyntax,
              error: null,
            });
          } catch (error) {
            setParsedMermaid({
              data: null,
              definition: null,
              error: String(error),
            });
          }
        }}
      >
        <textarea
          id="mermaid-input"
          rows={10}
          cols={50}
          name="mermaid-input"
          style={{ marginTop: "1rem" }}
          placeholder="Input Mermaid Syntax"
        />
        <br />
        <button type="submit" id="render-excalidraw-btn">
          {"Render to Excalidraw"}
        </button>
      </form>

      {parsedMermaid.definition && (
        <Mermaid definition={parsedMermaid.definition} id="custom-diagram" />
      )}

      {parsedMermaid.data && (
        <details id="parsed-data-details">
          <summary>{"Parsed data from parseMermaid"}</summary>
          <pre id="custom-parsed-data">{parsedMermaid.data}</pre>
        </details>
      )}

      {parsedMermaid.error && <div id="error">{parsedMermaid.error}</div>}
    </>
  );
}

export default CustomTest;
