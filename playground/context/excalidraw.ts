import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform";
import type {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import React, { useContext } from "react";
import { parseMermaid } from "../../src/parseMermaid";

export const ExcalidrawContext = React.createContext<{
  excalidrawAPI?: ExcalidrawImperativeAPI;
  addFiles: (files: BinaryFiles) => void;
  updateElements: (elements: ExcalidrawElementSkeleton[]) => void;
  translateMermaidToExcalidraw: (mermaidSyntax: string) => Promise<{
    mermaid: Awaited<ReturnType<typeof parseMermaid>>;
    excalidraw: { elements: ExcalidrawElementSkeleton[]; files?: BinaryFiles };
  }>;
  setApi: (api: ExcalidrawImperativeAPI) => void;
} | null>(null);

export const useExcalidraw = () => {
  const context = useContext(ExcalidrawContext);

  if (!context) {
    throw new Error("useExcalidraw must be used within a ExcalidrawProvider");
  }

  return context;
};
