import { useEffect, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  id: string;
  definition: string;
}

let renderCounter = 0;

export const MermaidDiagram = ({ definition, id }: MermaidProps) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    // Mermaid removes any existing DOM node with the render ID before drawing.
    const renderId = `mermaid-diagram-${id}-${renderCounter++}`;

    const render = async (definition: string) => {
      try {
        setError(null);

        const { svg } = await mermaid.render(renderId, definition);

        if (!isCancelled) {
          setSvg(svg);
        }
      } catch (err) {
        if (!isCancelled) {
          setSvg("");
          setError(String(err));
        }
      }
    };

    render(definition);

    return () => {
      isCancelled = true;
    };
  }, [definition, id]);

  return (
    <>
      <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />
      {error && <div id="error">{error}</div>}
    </>
  );
};
