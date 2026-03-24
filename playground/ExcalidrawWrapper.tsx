import { useEffect, useState } from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import type { MermaidData } from "./";
import { ensureExcalidrawFontsLoaded } from "./loadExcalidrawFonts";

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
    let isCancelled = false;

    if (!readyExcalidrawAPI || readyExcalidrawAPI.isDestroyed) {
      return undefined;
    }

    if (mermaidDefinition === "" || mermaidOutput === null) {
      readyExcalidrawAPI.resetScene();
      return undefined;
    }

    void (async () => {
      await ensureExcalidrawFontsLoaded();
      if (isCancelled || readyExcalidrawAPI.isDestroyed) {
        return;
      }

      const { elements, files } = graphToExcalidraw(mermaidOutput, {
        fontSize: DEFAULT_FONT_SIZE,
      });

      readyExcalidrawAPI.updateScene({
        elements: convertToExcalidrawElements(elements),
      });
      readyExcalidrawAPI.scrollToContent(
        readyExcalidrawAPI.getSceneElements(),
        {
          fitToContent: true,
        }
      );

      if (files) {
        readyExcalidrawAPI.addFiles(Object.values(files));
      }
    })();

    return () => {
      isCancelled = true;
    };
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
