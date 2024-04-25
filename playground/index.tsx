import { useState, useCallback, useDeferredValue } from "react";
import CustomTest from "./CustomTest.tsx";
import ExcalidrawWrapper from "./ExcalidrawWrapper.tsx";
import Testcases from "./Testcases.tsx";
import { parseMermaid } from "../src/parseMermaid.ts";

export interface MermaidData {
  syntax: string;
  output: Awaited<ReturnType<typeof parseMermaid>> | null;
  error: string | null;
}

const App = () => {
  const [mermaidData, setMermaidData] = useState<MermaidData>({
    syntax: "",
    output: null,
    error: null,
  });

  const mermaidSyntax = useDeferredValue(mermaidData.syntax);

  const handleUpdateSyntax = useCallback(
    async (mermaidSyntax: MermaidData["syntax"]) => {
      setMermaidData({
        syntax: mermaidSyntax,
        output: null,
        error: null,
      });
    },
    []
  );

  const handleDataParsed = useCallback(
    (parsedData: MermaidData["output"], err?: unknown) => {
      setMermaidData({
        syntax: mermaidData.syntax,
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
          mermaidSyntax={mermaidSyntax}
        />
      </div>
    </>
  );
};

export default App;
