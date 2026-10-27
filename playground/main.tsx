import React from "react";
import ReactDOM from "react-dom/client";
import App from "./index.tsx";
import { ensureExcalidrawFontsLoaded } from "./loadExcalidrawFonts.ts";

const root = ReactDOM.createRoot(document.getElementById("root")!);

void ensureExcalidrawFontsLoaded().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
