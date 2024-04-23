import { useState, useTransition, useEffect } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  id: string;
  definition: string;
}

export const Mermaid = ({ definition, id }: MermaidProps) => {
  const [svg, setSvg] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const render = async (id: string, definition: string) => {
      const { svg } = await mermaid.render(`mermaid-diagram-${id}`, definition);
      startTransition(() => {
        setSvg(svg);
      });
    };

    render(id, definition);
  }, [definition, id]);

  return (
    <div
      style={{ width: "50%" }}
      className="mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
