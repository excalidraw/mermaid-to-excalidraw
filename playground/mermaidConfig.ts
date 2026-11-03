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
 * (elbow arrows) apply to flowcharts and state diagrams. Swimlanes are stepped
 * anyway, and class and ER diagrams never are.
 */
export const getMermaidConfig = (steppedEdges: boolean): MermaidConfig =>
  steppedEdges ? { elbow: true } : {};

export const MermaidConfigContext = createContext<MermaidConfig>({});

export const useMermaidConfig = () => useContext(MermaidConfigContext);
