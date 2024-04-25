import { useEffect, useState } from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types.js";
import { parseMermaid } from "../src/parseMermaid";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import type { MermaidData } from "./";

interface ExcalidrawWrapperProps {
  mermaidDefinition: MermaidData["definition"];
  onMermaidDataParsed: (
    mermaid: MermaidData["output"],
    error?: unknown
  ) => void;
}
const ExcalidrawWrapper = ({
  mermaidDefinition,
  onMermaidDataParsed,
}: ExcalidrawWrapperProps) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    if (mermaidDefinition === "") {
      excalidrawAPI.resetScene();
      return;
    }

    const updateDiagram = async () => {
      try {
        const mermaid = await parseMermaid(mermaidDefinition);

        const { elements, files } = graphToExcalidraw(mermaid, {
          fontSize: DEFAULT_FONT_SIZE,
        });

        onMermaidDataParsed(mermaid);

        excalidrawAPI.updateScene({
          elements: convertToExcalidrawElements(elements),
        });
        excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
          fitToContent: true,
        });

        if (files) {
          excalidrawAPI.addFiles(Object.values(files));
        }
      } catch (err) {
        onMermaidDataParsed(null, err);
      }
    };

    updateDiagram();
  }, [mermaidDefinition]);

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
