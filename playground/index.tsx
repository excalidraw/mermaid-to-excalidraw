import { useState, useCallback, useDeferredValue } from "react";
import CustomTest from "./CustomTest.tsx";
import ExcalidrawWrapper from "./ExcalidrawWrapper.tsx";
import Testcases from "./Testcases.tsx";
import { parseMermaid } from "../src/parseMermaid.ts";

const App = () => {
  const [mermaid, setMermaid] = useState<{
    syntax: string;
    data: Awaited<ReturnType<typeof parseMermaid>> | null;
    error: unknown;
  }>({
    syntax: "",
    data: null,
    error: null,
  });

  const mermaidSyntax = useDeferredValue(mermaid.syntax);

  const handleUpdateSyntax = useCallback(async (mermaidSyntax: string) => {
    setMermaid({
      syntax: mermaidSyntax,
      data: null,
      error: null,
    });
  }, []);

  const handleDataParsed = useCallback(
    (
      parsedData: Awaited<ReturnType<typeof parseMermaid>> | null,
      err?: unknown
    ) => {
      setMermaid({
        syntax: mermaid.syntax,
        data: parsedData,
        error: err ? String(err) : null,
      });
    },
    [mermaid]
  );

  return (
    <>
      <section id="custom-test">
        <h1>{"Custom Test"}</h1>
        {"Supports only "}
        <a target="_blank" href="https://mermaid.js.org/syntax/flowchart.html">
          {"Flowchart"}
        </a>{" "}
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
        <CustomTest mermaid={mermaid} onChangeDefinition={handleUpdateSyntax} />
      </section>

      <Testcases onChangeDefinition={handleUpdateSyntax} />

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
