import "babel-polyfill";

import { Excalidraw } from "./Excalidraw";
import { flowDiagrams } from "./flowDiagrams";
import { graphToExcalidraw, parseMermaid } from "..";

// initialize Mermaid
const mermaid = window.mermaid;
mermaid.initialize({ startOnLoad: false });

const containerEl = document.getElementById("diagrams");

// skips some diagrams #n
// skip this because it a minor feature e.g. dashed arrow line, link, etc.
// we can support this later.
const SKIPS = [];
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
root.render(React.createElement(Excalidraw));

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
