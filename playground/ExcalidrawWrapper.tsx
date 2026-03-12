import { useEffect, useState } from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import type { MermaidData } from "./";

interface ExcalidrawWrapperProps {
  mermaidDefinition: MermaidData["definition"];
  mermaidOutput: MermaidData["output"];
  theme: "light" | "dark";
  apiRef?: React.MutableRefObject<ExcalidrawImperativeAPI | null>;
}

const ExcalidrawWrapper = ({
  mermaidDefinition,
  mermaidOutput,
  theme,
  apiRef,
}: ExcalidrawWrapperProps) => {
  const [readyExcalidrawAPI, setReadyExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (!readyExcalidrawAPI || readyExcalidrawAPI.isDestroyed) {
      return;
    }

    if (mermaidDefinition === "" || mermaidOutput === null) {
      readyExcalidrawAPI.resetScene();
      return;
    }

    const { elements, files } = graphToExcalidraw(mermaidOutput, {
      fontSize: DEFAULT_FONT_SIZE,
    });

    readyExcalidrawAPI.updateScene({
      elements: convertToExcalidrawElements(elements),
    });
    readyExcalidrawAPI.scrollToContent(readyExcalidrawAPI.getSceneElements(), {
      fitToContent: true,
    });

    if (files) {
      readyExcalidrawAPI.addFiles(Object.values(files));
    }
  }, [mermaidDefinition, mermaidOutput, readyExcalidrawAPI]);

  return (
    <div className="excalidraw-wrapper">
      <Excalidraw
        theme={theme}
        initialData={{
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
        }}
        onExcalidrawAPI={(api) => {
          if (apiRef) {
            apiRef.current = api;
          }
        }}
        onInitialize={(api) => {
          setReadyExcalidrawAPI(api);
        }}
        onUnmount={() => {
          setReadyExcalidrawAPI(null);
          if (apiRef) {
            apiRef.current = null;
          }
        }}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
