import { useEffect, useState } from "react";
import {
  convertToExcalidrawElements,
  exportToSvg,
} from "@excalidraw/excalidraw";
import { DEFAULT_FONT_SIZE } from "../src/constants";
import { graphToExcalidraw } from "../src/graphToExcalidraw";
import { parseDiagram } from "../src/parseDiagram";
import { ensureExcalidrawFontsLoaded } from "./loadExcalidrawFonts";

interface ExcalidrawSvgPreviewProps {
  definition: string;
}

let previewRenderQueue: Promise<void> = Promise.resolve();
const svgCache = new Map<string, string>();
const inFlightSvgCache = new Map<string, Promise<string>>();

const runSequentially = <T,>(task: () => Promise<T>) => {
  const run = previewRenderQueue.then(task, task);
  previewRenderQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
};

const generateExcalidrawSvg = async (definition: string): Promise<string> => {
  const cacheKey = definition;
  const cachedSvg = svgCache.get(cacheKey);
  if (cachedSvg) {
    return cachedSvg;
  }

  const pendingRender = inFlightSvgCache.get(cacheKey);
  if (pendingRender) {
    return pendingRender;
  }

  const renderPromise = runSequentially(async () => {
    const parsedMermaid = await parseDiagram(definition);
    const { elements, files } = graphToExcalidraw(parsedMermaid, {
      fontSize: DEFAULT_FONT_SIZE,
    });
    await ensureExcalidrawFontsLoaded();

    const svgElement = await exportToSvg({
      elements: convertToExcalidrawElements(elements),
      appState: {
        exportBackground: true,
        viewBackgroundColor: "#ffffff",
      },
      files: files ?? null,
      exportPadding: 16,
    });

    return svgElement.outerHTML;
  })
    .then((svg) => {
      svgCache.set(cacheKey, svg);
      return svg;
    })
    .finally(() => {
      inFlightSvgCache.delete(cacheKey);
    });

  inFlightSvgCache.set(cacheKey, renderPromise);
  return renderPromise;
};

export const ExcalidrawSvgPreview = ({
  definition,
}: ExcalidrawSvgPreviewProps) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    setIsLoading(true);
    setError(null);

    generateExcalidrawSvg(definition)
      .then((renderedSvg) => {
        if (!isCancelled) {
          setSvg(renderedSvg);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setSvg("");
          setError(String(err));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [definition]);

  if (error) {
    return <div className="preview-error">{error}</div>;
  }

  if (isLoading && !svg) {
    return (
      <div className="preview-loading">{"Rendering Excalidraw SVG..."}</div>
    );
  }

  return (
    <div
      className="excalidraw-svg-preview"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
