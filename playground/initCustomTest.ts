import mermaid from "mermaid";
import { parseMermaid } from "../src/parseMermaid";
import { DEFAULT_FONT_SIZE } from "./settings";
import renderExcalidraw from "./initExcalidraw";

const customTestEl = document.createElement("div");
const containerEl = document.getElementById("diagrams");
if (!containerEl) throw new Error("Container element not found");

// Init custom test section
customTestEl.innerHTML = `
  <h1>Custom Test</h1>
  <ul>
    <li>Support only flowchart diagram (the input must started with "flowchart")</li>
    <li>See supported and unsupported features at <a target="_blank" href="https://github.com/excalidraw/mermaid-to-excalidraw/pull/1#issue-1686226562">PR's description</a></li>
  </ul>
  <br>
  <textarea id="mermaid-input" rows="10" cols="50"></textarea><br>
  <label for="font-size-input">Custom Font Size: </label> <input type="number" id="font-size-input" value="${DEFAULT_FONT_SIZE}"><br>
  <button id="render-excalidraw-btn">Render to Excalidraw</button>
  <div id="custom-diagram"></div>
  <pre id="custom-parsed-data"></pre>
`;
containerEl.prepend(customTestEl);

// Handle render to Excalidraw event
const btn = document.getElementById("render-excalidraw-btn");
if (!btn) throw new Error("Button element not found");

btn.addEventListener("click", async () => {
  const mermaidInput = document.getElementById(
    "mermaid-input"
  ) as HTMLInputElement;
  if (!mermaidInput) throw new Error("Mermaid input element not found");
  const fontSizeInput = document.getElementById(
    "font-size-input"
  ) as HTMLInputElement;
  if (!fontSizeInput) throw new Error("Font size input element not found");
  const diagramDefinition = mermaidInput.value;
  const customFontSize = Number(fontSizeInput.value);

  const diagramEl = document.getElementById("custom-diagram");
  if (!diagramEl) throw new Error("Diagram element not found");
  const { svg } = await mermaid.render(
    `custom-digaram`,
    `%%{init: {"themeVariables": {"fontSize": "${customFontSize}px"}} }%%\n` +
      diagramDefinition
  );
  diagramEl.innerHTML = svg;

  const parsedData = await parseMermaid(mermaid, diagramDefinition, {
    fontSize: customFontSize,
  });
  const parsedDataEl = document.getElementById("custom-parsed-data");
  if (!parsedDataEl) throw new Error("Parsed data viewer element not found");
  parsedDataEl.innerText = JSON.stringify(parsedData, null, 2);

  renderExcalidraw(JSON.stringify(parsedData), customFontSize);
});
