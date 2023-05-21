import "babel-polyfill";

import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { flowDiagrams } from "./flowDiagrams";
import { graphToExcalidraw, parseMermaid } from "..";

// Initialize Mermaid
const mermaid = window.mermaid;
mermaid.initialize({ startOnLoad: false });

const containerEl = document.getElementById("diagrams");

// Custom test section
const customTestEl = document.createElement("div");
customTestEl.innerHTML = `
  <h1>Custom Test</h1>
  <textarea id="mermaid-input" rows="10" cols="50"></textarea><br>
  <button id="render-excalidraw-btn">Render to Excalidraw</button>
  <div id="custom-diagram"></div>
  <pre id="custom-parsed-data"></pre>
`;
containerEl.prepend(customTestEl);
document
  .getElementById("render-excalidraw-btn")
  .addEventListener("click", async () => {
    const diagramDefinition = document.getElementById("mermaid-input").value;

    const diagramEl = document.getElementById("custom-diagram");
    const { svg } = await mermaid.render(
      `custom-digaram`,
      `%%{init: {"themeVariables": {"fontSize": "${FONT_SIZE}px"}} }%%\n` +
        diagramDefinition
    );
    diagramEl.innerHTML = svg;

    const parsedData = await parseMermaid(mermaid, diagramDefinition, {
      fontSize: FONT_SIZE,
    });
    document.getElementById("custom-parsed-data").innerText = JSON.stringify(
      parsedData,
      null,
      2
    );
    renderExcalidraw(JSON.stringify(parsedData));
  });

// skips some diagrams #n
// skip this because it a minor feature e.g. dashed arrow line, link, etc.
// we can support this later.
const SKIPS = [35, 39, 40, 42];
const FONT_SIZE = 18;

// render the diagram
flowDiagrams.forEach(async (diagramDefinition, i) => {
  if (SKIPS.includes(i + 1)) return;

  const diagramContainerEl = document.createElement("div");
  diagramContainerEl.id = `diagram-container-${i}`;
  diagramContainerEl.innerHTML = `<h1>Test #${
    i + 1
  }</h1><div id="diagram-${i}"></div><button onclick="renderExcalidraw(document.getElementById('parsed-${i}').innerText)">Render to Excalidraw</button><pre id="parsed-${i}"></pre>`;

  const diagramEl = diagramContainerEl.querySelector(`#diagram-${i}`);
  const { svg } = await mermaid.render(
    `diagram-${i}`,
    `%%{init: {"themeVariables": {"fontSize": "${FONT_SIZE}px"}} }%%\n` +
      diagramDefinition
  );

  diagramEl.innerHTML = svg;
  containerEl.append(diagramContainerEl);

  // get parsed data
  const parsedDataViewerEl = diagramContainerEl.querySelector(`#parsed-${i}`);
  const data = await parseMermaid(mermaid, diagramDefinition, {
    fontSize: FONT_SIZE,
  });
  parsedDataViewerEl.innerHTML = JSON.stringify(data, null, 2);
});

// render default excalidraw
const excalidrawWrapper = document.getElementById("excalidraw");
let root = ReactDOM.createRoot(excalidrawWrapper);
root.render(React.createElement(ExcalidrawWrapper));

// Render to Excalidraw
function renderExcalidraw(mermaidDataString) {
  const data = JSON.parse(mermaidDataString);
  const elements = graphToExcalidraw(data, { fontSize: FONT_SIZE });

  console.log("renderExcalidraw", elements);

  root.unmount();
  root = ReactDOM.createRoot(excalidrawWrapper);
  root.render(
    React.createElement(Excalidraw, {
      elements,
    })
  );
}

window.renderExcalidraw = renderExcalidraw;
