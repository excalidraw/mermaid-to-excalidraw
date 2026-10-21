import {
  convertToExcalidrawElements,
  exportToSvg,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import { parseMermaidToExcalidraw, MermaidConfig } from "../../src/index";
import { ensureExcalidrawFontsLoaded } from "../../playground/loadExcalidrawFonts";

const wrapResourceText = (text: string) =>
  text
    .replace(
      /^\s*(`{3,}|~{3,})mermaid[^\S\r\n]*\r?\n[\s\S]*?^\s*\1[^\S\r\n]*$/gim,
      ""
    )
    .replace(/:resource\[([^\]]+)\]/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim()
    .split("\n")
    .map((line) => {
      const lines: string[] = [];
      let current = "";
      for (const word of line.split(/\s+/)) {
        if (current && current.length + word.length + 1 > 100) {
          lines.push(current);
          current = word;
        } else {
          current += (current ? " " : "") + word;
        }
      }
      lines.push(current);
      return lines.join("\n");
    })
    .join("\n");

declare global {
  interface Window {
    convertDiagram: (input: {
      definition: string;
      config: MermaidConfig;
      resources: string;
      svg: boolean;
    }) => Promise<{ json: string; svg?: string; imageFallback: boolean }>;
  }
}

window.convertDiagram = async ({ definition, config, resources, svg }) => {
  await ensureExcalidrawFontsLoaded();
  const result = await parseMermaidToExcalidraw(definition, config);
  const elements = convertToExcalidrawElements(result.elements);
  const resourceText = wrapResourceText(resources);
  if (resourceText) {
    const right = Math.max(
      0,
      ...elements.map((element) => element.x + element.width)
    );
    const top = Math.min(0, ...elements.map((element) => element.y));
    elements.push(
      ...convertToExcalidrawElements([
        {
          type: "text",
          text: resourceText,
          x: right + 120,
          y: top,
          fontSize: 16,
          fontFamily: 2,
          textAlign: "left",
        },
      ])
    );
  }
  const files = result.files ?? {};
  const appState = { viewBackgroundColor: "#ffffff", exportBackground: true };
  return {
    json: serializeAsJSON(elements, appState, files, "local"),
    svg: svg
      ? (await exportToSvg({ elements, appState, files })).outerHTML
      : undefined,
    imageFallback: elements.some((element) => element.type === "image"),
  };
};
