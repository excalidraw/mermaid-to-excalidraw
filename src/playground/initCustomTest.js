import { parseMermaid } from "../parseMermaid";
import { DEFAULT_FONT_SIZE } from "./settings";

// Init custom test section
const mermaid = window.mermaid;
const customTestEl = document.createElement("div");
const containerEl = document.getElementById("diagrams");
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
document
  .getElementById("render-excalidraw-btn")
  .addEventListener("click", async () => {
    const diagramDefinition = document.getElementById("mermaid-input").value;
    const customFontSize = document.getElementById("font-size-input").value;

    const diagramEl = document.getElementById("custom-diagram");
    const { svg } = await mermaid.render(
      `custom-digaram`,
      `%%{init: {"themeVariables": {"fontSize": "${customFontSize}px"}} }%%\n` +
        diagramDefinition
    );
    diagramEl.innerHTML = svg;

    const parsedData = await parseMermaid(mermaid, diagramDefinition, {
      fontSize: customFontSize,
    });
    document.getElementById("custom-parsed-data").innerText = JSON.stringify(
      parsedData,
      null,
      2
    );
    renderExcalidraw(JSON.stringify(parsedData), customFontSize);
  });
