import ExcalidrawWrapper from "./ExcalidrawWrapper";
import { graphToExcalidraw } from "..";
import { DEFAULT_FONT_SIZE } from "./settings";

// render default excalidraw
const excalidrawWrapper = document.getElementById("excalidraw");
let root = ReactDOM.createRoot(excalidrawWrapper);
root.render(React.createElement(ExcalidrawWrapper));

// Render to Excalidraw
function renderExcalidraw(mermaidDataString) {
  const data = JSON.parse(mermaidDataString);
  const elements = graphToExcalidraw(data, { fontSize: DEFAULT_FONT_SIZE });

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
