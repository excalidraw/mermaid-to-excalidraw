import { useCallback, useMemo, useRef } from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types.js";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";
import { parseMermaid } from "../src/parseMermaid";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import { ExcalidrawContext, useExcalidraw } from "./context/excalidraw";

export const ExcalidrawProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const excalidrawAPI = useRef<ExcalidrawImperativeAPI>();

  const updateElements = useCallback(
    (elements: ExcalidrawElementSkeleton[]) => {
      if (!excalidrawAPI.current) {
        return;
      }

      excalidrawAPI.current.updateScene({
        elements: convertToExcalidrawElements(elements),
      });

      excalidrawAPI.current.scrollToContent(
        excalidrawAPI.current.getSceneElements(),
        {
          fitToContent: true,
        }
      );
    },
    []
  );

  const addFiles = useCallback((files: BinaryFiles) => {
    if (!excalidrawAPI.current) {
      return;
    }

    excalidrawAPI.current.addFiles(Object.values(files));
  }, []);

  const setApi = useCallback((api: ExcalidrawImperativeAPI) => {
    excalidrawAPI.current = api;
  }, []);

  const translateMermaidToExcalidraw = useCallback(
    async (mermaidSyntax: string) => {
      const mermaid = await parseMermaid(mermaidSyntax);

      const { elements, files } = graphToExcalidraw(mermaid, {
        fontSize: DEFAULT_FONT_SIZE,
      });

      updateElements(elements);

      if (files) {
        addFiles(files);
      }

      return { mermaid, excalidraw: { elements, files } };
    },
    [updateElements, addFiles]
  );

  const context = useMemo(
    () => ({
      excalidrawAPI: excalidrawAPI.current,
      addFiles,
      updateElements,
      setApi,
      translateMermaidToExcalidraw,
    }),
    [addFiles, updateElements, setApi, translateMermaidToExcalidraw]
  );

  return (
    <ExcalidrawContext.Provider value={context}>
      {children}
    </ExcalidrawContext.Provider>
  );
};

const ExcalidrawWrapper = () => {
  const excalidraw = useExcalidraw();

  return (
    <div className="excalidraw-wrapper">
      <Excalidraw
        initialData={{
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
        }}
        excalidrawAPI={excalidraw?.setApi}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
