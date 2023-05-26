import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { graphToExcalidraw } from "..";
import { DEFAULT_FONT_SIZE } from "./settings";

// render default excalidraw
const excalidrawWrapper = document.getElementById("excalidraw");
let root = ReactDOM.createRoot(excalidrawWrapper);
root.render(React.createElement(ExcalidrawWrapper));

// Render to Excalidraw
function renderExcalidraw(mermaidDataString, fontSize = DEFAULT_FONT_SIZE) {
  const data = JSON.parse(mermaidDataString);
  const elements = graphToExcalidraw(data, { fontSize });

  console.log("renderExcalidraw", elements);

  root.unmount();
  root = ReactDOM.createRoot(excalidrawWrapper);
  root.render(
    React.createElement(ExcalidrawWrapper, {
      elements,
    })
  );
}

window.renderExcalidraw = renderExcalidraw;
