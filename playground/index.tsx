import { useState, useCallback, useDeferredValue } from "react";
import CustomTest from "./CustomTest.tsx";
import ExcalidrawWrapper from "./ExcalidrawWrapper.tsx";
import Testcases from "./Testcases.tsx";
import { parseMermaid } from "../src/parseMermaid.ts";

export interface MermaidData {
  definition: string;
  output: Awaited<ReturnType<typeof parseMermaid>> | null;
  error: string | null;
}

const App = () => {
  const [mermaidData, setMermaidData] = useState<MermaidData>({
    definition: "",
    output: null,
    error: null,
  });

  const mermaidDefinition = useDeferredValue(mermaidData.definition);

  const handleUpdateSyntax = useCallback(
    async (definition: MermaidData["definition"]) => {
      setMermaidData({
        definition,
        output: null,
        error: null,
      });
    },
    []
  );

  const handleDataParsed = useCallback(
    (parsedData: MermaidData["output"], err?: unknown) => {
      setMermaidData({
        definition: mermaidData.definition,
        output: parsedData,
        error: err ? String(err) : null,
      });
    },
    [mermaidData]
  );

  return (
    <>
      <section id="custom-test">
        <h1>{"Custom Test"}</h1>
        {"Supports only "}
        <a target="_blank" href="https://mermaid.js.org/syntax/flowchart.html">
          {"Flowchart"}
        </a>
        {", "}
        <a
          target="_blank"
          href="https://mermaid.js.org/syntax/sequenceDiagram.html"
        >
          {"Sequence "}
        </a>
        {"and "}
        <a
          target="_blank"
          href="https://mermaid.js.org/syntax/classDiagram.html"
        >
          {"class "}
        </a>
        {"diagrams."}
        <br />
        <CustomTest mermaidData={mermaidData} onChange={handleUpdateSyntax} />
      </section>

      <Testcases onChange={handleUpdateSyntax} />

      <div id="excalidraw">
        <ExcalidrawWrapper
          onMermaidDataParsed={handleDataParsed}
          mermaidDefinition={mermaidDefinition}
        />
      </div>
    </>
  );
};

export default App;
