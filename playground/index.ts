import mermaid from "mermaid";
import { parseMermaid } from "../src";
import { FLOWCHART_DIAGRAM_TESTCASES } from "./flowchartDiagramTestcases";

// Initialize Mermaid
mermaid.initialize({ startOnLoad: false });

import "./initCustomTest";
import renderExcalidraw from "./initExcalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";

const SKIP_CASES = [35, 39, 40, 42];

// Render all the diagram test cases
const containerEl = document.getElementById("diagrams");
if (!containerEl) throw new Error("Container element not found");

FLOWCHART_DIAGRAM_TESTCASES.forEach(async (diagramDefinition: string, i) => {
  if (SKIP_CASES.includes(i + 1)) return;

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

  const btn = diagramContainerEl.querySelector(`#diagram-btn-${i}`);
  if (!btn) throw new Error("Button element not found");
  btn.addEventListener("click", async () => {
    const data = btn.getAttribute("data");
    const pd = document.getElementById(`parsed-${data}`);
    if (!pd) throw new Error("Parsed data viewer element not found");
    renderExcalidraw(pd.innerHTML);
  });

  const diagramEl = diagramContainerEl.querySelector(`#diagram-${i}`);
  if (!diagramEl) throw new Error("Diagram element not found");
  const { svg } = await mermaid.render(
    `diagram-${i}`,
    `%%{init: {"themeVariables": {"fontSize": "${DEFAULT_FONT_SIZE}px"}} }%%\n` +
      diagramDefinition
  );

  diagramEl.innerHTML = svg;
  containerEl.append(diagramContainerEl);

  // Render mermaid syntax
  const mermaidSyntaxEl = diagramContainerEl.querySelector(
    `#mermaid-syntax-${i}`
  );
  if (!mermaidSyntaxEl) throw new Error("Mermaid syntax element not found");
  mermaidSyntaxEl.innerHTML = diagramDefinition;

  // Get parsed data
  const parsedDataViewerEl = diagramContainerEl.querySelector(`#parsed-${i}`);
  if (!parsedDataViewerEl)
    throw new Error("Parsed data viewer element not found");

  try {
    const data = await parseMermaid(mermaid, diagramDefinition, {
      fontSize: DEFAULT_FONT_SIZE,
    });
    parsedDataViewerEl.innerHTML = JSON.stringify(data, null, 2);
  } catch (e) {
    console.error(e);
  }
});

// TODO: refactor playground TS code
