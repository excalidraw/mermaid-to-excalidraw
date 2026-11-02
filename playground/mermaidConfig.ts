import { createContext, useContext } from "react";
import type { MermaidConfig } from "../src/interfaces";

const STEPPED_EDGES_STORAGE_KEY = "mermaid-to-excalidraw-stepped-edges";

export const readSteppedEdges = () => {
  try {
    return localStorage.getItem(STEPPED_EDGES_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const writeSteppedEdges = (steppedEdges: boolean) => {
  try {
    localStorage.setItem(STEPPED_EDGES_STORAGE_KEY, String(steppedEdges));
  } catch (error) {
    console.error("Failed to save stepped edges to localStorage:", error);
  }
};

/**
 * The config the playground parses and renders diagrams with. Stepped edges
 * (Pele's `curve: "step"`) apply to flowcharts and state diagrams, which
 * Pele routes with the flowchart's curve. Swimlanes are stepped anyway, and
 * Pele ignores the curve for class and ER diagrams.
 */
export const getMermaidConfig = (steppedEdges: boolean): MermaidConfig =>
  steppedEdges ? { flowchart: { curve: "step" } } : {};

export const MermaidConfigContext = createContext<MermaidConfig>({});

export const useMermaidConfig = () => useContext(MermaidConfigContext);
