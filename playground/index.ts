import mermaid from "mermaid";
import { parseMermaid } from "../src";
import FLOWCHART_DIAGRAM_TESTCASES from "./testcases/flowchart";
import UNSUPPORTED_DIAGRAM_TESTCASES from "./testcases/unsupported";
import { DEFAULT_FONT_SIZE } from "../src/constants";

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false });

import "./initCustomTest";
import { renderExcalidraw } from "./initExcalidraw";

(async () => {
  // Render flowchart diagrams
  const flowchartContainer = document.createElement("div");
  document.body.appendChild(flowchartContainer);
  await Promise.all(
    FLOWCHART_DIAGRAM_TESTCASES.map((diagramDefinition, i) => {
      return renderDiagram(flowchartContainer, diagramDefinition, i);
    })
  );

  // Render unsupported diagrams
  const unsupportedContainer = document.createElement("div");
  unsupportedContainer.innerHTML = `
    <h1 style="margin-top: 50px">Unsupported diagrams</h1>
    <p>Unsupported diagram will be rendered as SVG image.</p>
  `;
  const indexOffset = FLOWCHART_DIAGRAM_TESTCASES.length;
  document.body.appendChild(unsupportedContainer);
  await Promise.all(
    UNSUPPORTED_DIAGRAM_TESTCASES.map((diagramDefinition, i) => {
      return renderDiagram(
        unsupportedContainer,
        diagramDefinition,
        i + indexOffset
      );
    })
  );

  const spinner = document.getElementById("diagram-loading-spinner")!;
  spinner.style.display = "none";
})();

async function renderDiagram(
  containerEl: HTMLElement,
  diagramDefinition: string,
  i: number
) {
  const diagramContainerEl = document.createElement("div");
  diagramContainerEl.id = `diagram-container-${i}`;
  diagramContainerEl.innerHTML = `<h2 style="margin-top: 50px">Test #${i + 1}
  </h2>
  <div id="diagram-${i}"></div>
  <button id="diagram-btn-${i}" data="${i}">Render to Excalidraw</button>
  <details style="margin-top: 20px">
    <summary>Mermaid syntax</summary>
    <pre id="mermaid-syntax-${i}"></pre>
  </details>
  <details style="margin-top: 10px">
    <summary>Parsed data from parseMermaid</summary>
    <pre id="parsed-${i}"></pre>
  </details>`;

  const btn = diagramContainerEl.querySelector(`#diagram-btn-${i}`)!;

  btn.addEventListener("click", async () => {
    const data = btn.getAttribute("data");
    const pd = document.getElementById(`parsed-${data}`)!;
    renderExcalidraw(pd.innerHTML);
  });

  const diagramEl = diagramContainerEl.querySelector(`#diagram-${i}`)!;
  const { svg } = await mermaid.render(
    `diagram-${i}`,
    `%%{init: {"themeVariables": {"fontSize": "${DEFAULT_FONT_SIZE}px"}} }%%\n${diagramDefinition}`
  );

  diagramEl.innerHTML = svg;
  containerEl.append(diagramContainerEl);

  // Render mermaid syntax
  const mermaidSyntaxEl = diagramContainerEl.querySelector(
    `#mermaid-syntax-${i}`
  )!;
  mermaidSyntaxEl.innerHTML = diagramDefinition;

  // Get parsed data
  try {
    const data = await parseMermaid(mermaid, diagramDefinition, {
      fontSize: DEFAULT_FONT_SIZE,
    });

    const parsedDataViewerEl = diagramContainerEl.querySelector(
      `#parsed-${i}`
    )!;
    parsedDataViewerEl.innerHTML = JSON.stringify(data, null, 2);
  } catch (e) {
    console.error("Playground Error:", e);
  }
}
