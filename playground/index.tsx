import CustomTest from "./CustomTest.tsx";
import ExcalidrawWrapper, { ExcalidrawProvider } from "./ExcalidrawWrapper.tsx";
import Testcases from "./Testcases.tsx";

function App() {
  return (
    <ExcalidrawProvider>
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
        <CustomTest />
      </section>

      <Testcases />

      <div id="excalidraw">
        <ExcalidrawWrapper />
      </div>
    </ExcalidrawProvider>
  );
}

export default App;
