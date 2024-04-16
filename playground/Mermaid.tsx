import mermaid from "mermaid";
import React from "react";

interface MermaidProps {
  id: string;
  definition: string;
}

export function Mermaid({ definition, id }: MermaidProps) {
  const [svg, setSvg] = React.useState("");
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
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
}
