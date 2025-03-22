import { useEffect, useState } from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import type { MermaidData } from "./";
import "@excalidraw/excalidraw/index.css";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface ExcalidrawWrapperProps {
  mermaidDefinition: MermaidData["definition"];
  mermaidOutput: MermaidData["output"];
}

const ExcalidrawWrapper = ({
  mermaidDefinition,
  mermaidOutput,
}: ExcalidrawWrapperProps) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    if (mermaidDefinition === "" || mermaidOutput === null) {
      excalidrawAPI.resetScene();
      return;
    }

    const { elements, files } = graphToExcalidraw(mermaidOutput, {
      fontSize: DEFAULT_FONT_SIZE,
    });

    excalidrawAPI.updateScene({
      elements: convertToExcalidrawElements(elements),
    });
    excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
      fitToContent: true,
    });

    if (files) {
      excalidrawAPI.addFiles(Object.values(files));
    }
  }, [mermaidDefinition, mermaidOutput]);

  return (
    <div className="excalidraw-wrapper">
      <Excalidraw
        initialData={{
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
        }}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
