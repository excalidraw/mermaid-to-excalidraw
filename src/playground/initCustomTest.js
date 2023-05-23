// Init custom test section
const mermaid = window.mermaid;
const customTestEl = document.createElement("div");
const containerEl = document.getElementById("diagrams");
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
      `%%{init: {"themeVariables": {"fontSize": "${DEFAULT_FONT_SIZE}px"}} }%%\n` +
        diagramDefinition
    );
    diagramEl.innerHTML = svg;

    const parsedData = await parseMermaid(mermaid, diagramDefinition, {
      fontSize: DEFAULT_FONT_SIZE,
    });
    document.getElementById("custom-parsed-data").innerText = JSON.stringify(
      parsedData,
      null,
      2
    );
    renderExcalidraw(JSON.stringify(parsedData));
  });
