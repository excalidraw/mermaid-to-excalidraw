import mermaid from "mermaid";
import { parseMermaid } from "../src/parseMermaid.js";
import FLOWCHART_DIAGRAM_TESTCASES from "./testcases/flowchart.js";
import { SEQUENCE_DIAGRAM_TESTCASES } from "./testcases/sequence.js";
import { CLASS_DIAGRAM_TESTCASES } from "./testcases/class.js";
import UNSUPPORTED_DIAGRAM_TESTCASES from "./testcases/unsupported.js";

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false });

import "./initCustomTest";
import { renderExcalidraw } from "./initExcalidraw.js";

let indexOffset = 0;
(async () => {
  // Render flowchart diagrams
  const flowchartContainer = document.getElementById("flowchart-container")!;
  await Promise.all(
    FLOWCHART_DIAGRAM_TESTCASES.map(async (defination, index) => {
      const name = `Test ${index + 1}`;
      await renderDiagram(flowchartContainer, name, defination, index);
    })
  );
  indexOffset += FLOWCHART_DIAGRAM_TESTCASES.length;
  // Render Sequence diagrams
  const sequenceContainer = document.getElementById("sequence-container")!;
  await Promise.all(
    SEQUENCE_DIAGRAM_TESTCASES.map(({ name, defination }, index) => {
      return renderDiagram(
        sequenceContainer,
        name,
        defination,
        index + indexOffset
      );
    })
  );
  indexOffset += SEQUENCE_DIAGRAM_TESTCASES.length;

  // Render Class diagrams
  const classContainer = document.getElementById("class-container")!;
  await Promise.all(
    CLASS_DIAGRAM_TESTCASES.map(({ name, defination }, index) => {
      return renderDiagram(
        classContainer,
        name,
        defination,
        index + indexOffset
      );
    })
  );
  indexOffset += CLASS_DIAGRAM_TESTCASES.length;

  // Render unsupported diagrams
  const unsupportedContainer = document.getElementById("unsupported")!;
  unsupportedContainer.innerHTML = `
      <p>Unsupported diagram will be rendered as SVG image.</p>
    `;
  await Promise.all(
    UNSUPPORTED_DIAGRAM_TESTCASES.map(async (testcase, index) => {
      const { name, defination } = testcase;

      await renderDiagram(
        unsupportedContainer,
        name,
        defination,
        index + indexOffset
      );
    })
  );

  const spinner = document.getElementById("diagram-loading-spinner")!;
  spinner.style.display = "none";
})();

async function renderDiagram(
  containerEl: HTMLElement,
  name: string,
  diagramDefinition: string,
  i: number
) {
  const diagramContainerEl = document.createElement("div");
  diagramContainerEl.id = `diagram-container-${i}`;
  diagramContainerEl.innerHTML = `<h2 style="margin-top: 50px; color:#f06595;">${name}
  </h2>
  
  <pre style="font-size:16px; font-weight:600;font-style:italic;background:#eeeef1;width:40vw;padding:5px" id="mermaid-syntax-${i}"></pre>

  <button id="diagram-btn-${i}" data="${i}">Render to Excalidraw</button>
  <div id="diagram-${i}" style="width:50%"></div>`;

  const btn = diagramContainerEl.querySelector(`#diagram-btn-${i}`)!;

  btn.addEventListener("click", async () => {
    const data = await parseMermaid(diagramDefinition);
    renderExcalidraw(JSON.stringify(data));
  });

  const diagramEl = diagramContainerEl.querySelector(`#diagram-${i}`)!;
  const { svg } = await mermaid.render(`diagram-${i}`, diagramDefinition);

  diagramEl.innerHTML = svg;
  containerEl.append(diagramContainerEl);

  // Render mermaid syntax
  const mermaidSyntaxEl = diagramContainerEl.querySelector(
    `#mermaid-syntax-${i}`
  )!;
  mermaidSyntaxEl.innerHTML = diagramDefinition;
}
