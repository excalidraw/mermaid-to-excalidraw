import { useEffect, useState } from "react";
import mermaid from "mermaid";
import { runMermaidTaskSequentially } from "../src/mermaidExecutionQueue.ts";

interface MermaidProps {
  id: string;
  definition: string;
}

let renderCounter = 0;

export const MermaidDiagram = ({ definition, id }: MermaidProps) => {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let isCancelled = false;
    // Mermaid removes any existing DOM node with the render ID before drawing.
    const renderId = `mermaid-diagram-${id}-${renderCounter++}`;
    const tempContainer = document.createElement("div");
    tempContainer.setAttribute(
      "style",
      `opacity: 0; position: fixed; z-index: -1; left: -99999px; top: -99999px;`
    );

    if (!definition.trim()) {
      setSvg("");
      return;
    }

    document.body.appendChild(tempContainer);

    const render = async (definition: string) => {
      try {
        const { svg } = await runMermaidTaskSequentially(() =>
          mermaid.render(renderId, definition, tempContainer)
        );

        if (!isCancelled) {
          setSvg(svg);
        }
      } catch (err) {
        if (!isCancelled) {
          setSvg("");
        }
      } finally {
        tempContainer.remove();
      }
    };

    render(definition);

    return () => {
      isCancelled = true;
      tempContainer.remove();
    };
  }, [definition, id]);

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
};
