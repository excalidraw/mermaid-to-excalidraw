import {
  DEFAULT_DIAGRAM_ENGINE,
  type DiagramEngine,
} from "../src/parseDiagram.ts";

export const DIAGRAM_ENGINES: DiagramEngine[] = ["mermaid", "pele"];

export const ENGINE_LABELS: Record<DiagramEngine, string> = {
  mermaid: "Mermaid",
  pele: "Pele",
};

const ENGINE_STORAGE_KEY = "mermaid-to-excalidraw-engine";

const isDiagramEngine = (value: unknown): value is DiagramEngine =>
  DIAGRAM_ENGINES.includes(value as DiagramEngine);

/** `?engine=` takes precedence over the last engine picked. */
export const readInitialEngine = (): DiagramEngine => {
  const urlEngine = new URLSearchParams(window.location.search).get("engine");
  if (isDiagramEngine(urlEngine)) {
    return urlEngine;
  }

  try {
    const storedEngine = window.localStorage.getItem(ENGINE_STORAGE_KEY);
    return isDiagramEngine(storedEngine)
      ? storedEngine
      : DEFAULT_DIAGRAM_ENGINE;
  } catch {
    return DEFAULT_DIAGRAM_ENGINE;
  }
};

export const writeStoredEngine = (engine: DiagramEngine) => {
  try {
    window.localStorage.setItem(ENGINE_STORAGE_KEY, engine);
  } catch (error) {
    console.error("Failed to save engine to localStorage:", error);
  }
};
