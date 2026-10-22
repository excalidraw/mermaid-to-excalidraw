import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { runMermaidTaskSequentially } from "../src/mermaidExecutionQueue.ts";
import { withMermaidLineBreaks } from "../src/mermaidLineBreaks.ts";
import { withLineBreakFallback } from "../src/text.ts";
import { renderPeleSvg } from "../src/pele/parsePele.ts";
import { DEFAULT_FONT_SIZE } from "../src/constants.ts";
import type { DiagramEngine } from "../src/parseDiagram.ts";

interface MermaidProps {
  id: string;
  definition: string;
  engine: DiagramEngine;
}

let renderCounter = 0;

const renderMermaidSvg = async (id: string, definition: string) => {
  // Mermaid removes any existing DOM node with the render ID before drawing.
  const renderId = `mermaid-diagram-${id}-${renderCounter++}`;
  const tempContainer = document.createElement("div");
  tempContainer.setAttribute(
    "style",
    `opacity: 0; position: fixed; z-index: -1; left: -99999px; top: -99999px;`
  );
  document.body.appendChild(tempContainer);

  try {
    const { svg } = await runMermaidTaskSequentially(() =>
      withLineBreakFallback(definition, (candidate) =>
        withMermaidLineBreaks(candidate, () =>
          mermaid.render(renderId, candidate, tempContainer)
        )
      )
    );
    return svg;
  } finally {
    tempContainer.remove();
  }
};

// Mermaid renders one diagram at a time, so re-rendering every example after
// switching engines takes seconds. Rendered SVGs are cached per diagram (not
// shared between diagrams: Mermaid SVGs reference their own element ids).
const svgCache = new Map<string, string>();
const inFlightSvgCache = new Map<string, Promise<string>>();

const getCacheKey = (engine: DiagramEngine, id: string, definition: string) =>
  `${engine}:${id}:${definition}`;

const renderSvg = (engine: DiagramEngine, id: string, definition: string) => {
  const cacheKey = getCacheKey(engine, id, definition);
  const pendingRender = inFlightSvgCache.get(cacheKey);
  if (pendingRender) {
    return pendingRender;
  }

  const render = (
    engine === "pele"
      ? renderPeleSvg(definition, { fontSize: DEFAULT_FONT_SIZE })
      : renderMermaidSvg(id, definition)
  )
    .then((svg) => {
      svgCache.set(cacheKey, svg);
      return svg;
    })
    .finally(() => {
      inFlightSvgCache.delete(cacheKey);
    });

  inFlightSvgCache.set(cacheKey, render);
  return render;
};

/** The diagram as rendered by the engine that lays it out for conversion. */
export const MermaidDiagram = ({ definition, id, engine }: MermaidProps) => {
  const [rendered, setRendered] = useState<{
    engine: DiagramEngine;
    svg: string;
  } | null>(null);
  const cachedSvg = svgCache.get(getCacheKey(engine, id, definition));

  useEffect(() => {
    let isCancelled = false;

    if (!definition.trim()) {
      setRendered(null);
      return;
    }
    if (cachedSvg !== undefined) {
      return;
    }

    renderSvg(engine, id, definition)
      .then((svg) => {
        if (!isCancelled) {
          setRendered({ engine, svg });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setRendered({ engine, svg: "" });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [definition, id, engine, cachedSvg]);

  // While a render is pending, keep showing the last SVG of the same engine
  // (e.g. while typing), but never one of the other engine.
  const svg =
    cachedSvg ??
    (rendered?.engine === engine && definition.trim() ? rendered.svg : "");

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
};
