import { useState, useCallback, useDeferredValue } from "react";
import CustomTest from "./CustomTest.tsx";
import ExcalidrawWrapper from "./ExcalidrawWrapper.tsx";
import Testcases from "./Testcases.tsx";
import { parseMermaid } from "../src/parseMermaid.ts";

export interface MermaidData {
  definition: string;
  output: Awaited<ReturnType<typeof parseMermaid>> | null;
}

export type UpdateMermaidDefinition = (
  definition: string,
  isCustom: boolean
) => void;

const App = () => {
  const [mermaidData, setMermaidData] = useState<MermaidData>({
    definition: "",
    output: null,
  });
  const [isActiveCustomTest, setIsActiveCustomTest] = useState(false);

  const deferredMermaidData = useDeferredValue(mermaidData);

  const handleUpdateMermaidDefinition = useCallback(
    async (definition: MermaidData["definition"], isCustom: boolean) => {
      try {
        setIsActiveCustomTest(isCustom);

        const mermaid = await parseMermaid(definition);

        setMermaidData({
          definition,
          output: mermaid,
        });
      } catch (err) {
        setMermaidData({
          definition,
          output: null,
        });
      }
    },
    []
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
        <CustomTest
          isActive={isActiveCustomTest}
          mermaidData={deferredMermaidData}
          onChange={handleUpdateMermaidDefinition}
        />
      </section>

      <Testcases
        isCustomTest={isActiveCustomTest}
        onChange={handleUpdateMermaidDefinition}
      />

      <div id="excalidraw">
        <ExcalidrawWrapper
          mermaidDefinition={deferredMermaidData.definition}
          mermaidOutput={deferredMermaidData.output}
        />
      </div>
    </>
  );
};

export default App;
