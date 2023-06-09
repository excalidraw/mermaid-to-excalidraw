import mermaid from "mermaid";
import { parseMermaid } from "../src/parseMermaid";
import { renderExcalidraw } from "./initExcalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";

const customTestEl = document.createElement("div");

// Init custom test section
customTestEl.innerHTML = `
  <h1>Custom Test</h1>
  <ul>
    <li>Support only flowchart diagram (the input must started with "flowchart")</li>
    <li>See supported and unsupported features at <a target="_blank" href="https://github.com/excalidraw/mermaid-to-excalidraw/pull/1#issue-1686226562">PR's description</a></li>
  </ul>
  <br>
  <textarea id="mermaid-input" rows="10" cols="50" placeholder="Input Mermaid Syntax"></textarea><br>
  <label for="font-size-input">Custom Font Size: </label> <input type="number" id="font-size-input" value="${DEFAULT_FONT_SIZE}"><br>
  <button style="margin-top: 10px" id="render-excalidraw-btn">Render to Excalidraw</button>
  <div style="margin-top: 20px" id="custom-diagram"></div>
  <details style="margin-top: 20px; display: none;">
    <summary>Parsed data from parseMermaid</summary>
    <pre id="custom-parsed-data"></pre>
  </details>
  <div id="error" style="display: none; color: red; margin-top: 20px;"></div>
`;
document.body.appendChild(customTestEl);

// Handle render to Excalidraw event
const btn = document.getElementById("render-excalidraw-btn");
if (!btn) {
  throw new Error("Button element not found");
}

const errorEl: HTMLElement | null = customTestEl.querySelector("#error");
if (!errorEl) {
  throw new Error("Error element not found");
}

btn.addEventListener("click", async () => {
  errorEl.style.display = "none";

  try {
    // Get inputs
    const mermaidInput = document.getElementById(
      "mermaid-input"
    ) as HTMLInputElement;
    if (!mermaidInput) {
      throw new Error("Mermaid input element not found");
    }
    const fontSizeInput = document.getElementById(
      "font-size-input"
    ) as HTMLInputElement;
    if (!fontSizeInput) {
      throw new Error("Font size input element not found");
    }
    const diagramDefinition = mermaidInput.value;
    const customFontSize = Number(fontSizeInput.value);

    // Render Mermaid diagram
    const diagramEl = document.getElementById("custom-diagram");
    if (!diagramEl) {
      throw new Error("Diagram element not found");
    }
    const { svg } = await mermaid.render(
      `custom-digaram`,
      `%%{init: {"themeVariables": {"fontSize": "${customFontSize}px"}} }%%\n${diagramDefinition}`
    );
    diagramEl.innerHTML = svg;

    // Parse Mermaid diagram and render to Excalidraw
    const parsedData = await parseMermaid(mermaid, diagramDefinition, {
      fontSize: customFontSize,
    });

    const parsedDataEl = document.getElementById("custom-parsed-data");
    if (!parsedDataEl) {
      throw new Error("Parsed data viewer element not found");
    }
    if (parsedDataEl.parentElement) {
      parsedDataEl.parentElement.style.display = "block";
    }
    parsedDataEl.innerText = JSON.stringify(parsedData, null, 2);

    renderExcalidraw(JSON.stringify(parsedData), customFontSize);
  } catch (e: any) {
    errorEl.style.display = "block";
    errorEl.innerHTML = String(e);
    console.error("Custom Test Error:", e);
  }
});
