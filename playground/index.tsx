import { useState, useCallback, useDeferredValue } from "react";
import CustomTest from "./CustomTest.tsx";
import ExcalidrawWrapper from "./ExcalidrawWrapper.tsx";
import Testcases from "./Testcases.tsx";
import { parseMermaid } from "../src/parseMermaid.ts";
import GitHubCorner from "./GitHubCorner.tsx";
import Split from "react-split";

export interface MermaidData {
  definition: string;
  output: Awaited<ReturnType<typeof parseMermaid>> | null;
  error: string | null;
}

export type ActiveTestCaseIndex = number | "custom" | null;

const App = () => {
  const [mermaidData, setMermaidData] = useState<MermaidData>({
    definition: "",
    error: null,
    output: null,
  });

  const [activeTestCaseIndex, setActiveTestCaseIndex] =
    useState<ActiveTestCaseIndex>(null);
  const deferredMermaidData = useDeferredValue(mermaidData);

  const handleOnChange = useCallback(
    async (
      definition: MermaidData["definition"],
      activeTestCaseIndex: ActiveTestCaseIndex
    ) => {
      try {
        setActiveTestCaseIndex(activeTestCaseIndex);

        const mermaid = await parseMermaid(definition);

        setMermaidData({
          definition,
          output: mermaid,
          error: null,
        });
      } catch (error) {
        setMermaidData({
          definition,
          output: null,
          error: String(error),
        });
      }
    },
    []
  );

  return (
    <Split
      className="split"
      sizes={[50, 50]}
      minSize={460}
      gutterSize={3}
      gutterAlign="center"
    >
      <div className="mermaid-container">
        <div className="mermaid-header-container">
          <section id="custom-test">
            <h1>{"Custom Test"}</h1>
            {"Supports only "}
            <a
              target="_blank"
              href="https://mermaid.js.org/syntax/flowchart.html"
            >
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
              {"Class "}
            </a>
            {"diagrams."}
            <br />
            <CustomTest
              activeTestCaseIndex={activeTestCaseIndex}
              mermaidData={deferredMermaidData}
              onChange={handleOnChange}
            />
          </section>
          <GitHubCorner />
        </div>
        <Testcases
          activeTestCaseIndex={activeTestCaseIndex}
          onChange={handleOnChange}
        />
      </div>

      <div id="excalidraw">
        <ExcalidrawWrapper
          mermaidDefinition={deferredMermaidData.definition}
          mermaidOutput={deferredMermaidData.output}
        />
      </div>
    </Split>
  );
};

export default App;
