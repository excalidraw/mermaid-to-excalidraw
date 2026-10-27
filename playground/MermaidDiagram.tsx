import { useEffect, useState } from "react";
import { renderPeleSvg } from "../src/pele/parsePele.ts";
import { DEFAULT_FONT_SIZE } from "../src/constants.ts";

interface MermaidProps {
  definition: string;
}

/** The diagram as Pele lays it out for conversion. */
export const MermaidDiagram = ({ definition }: MermaidProps) => {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let isCancelled = false;

    if (!definition.trim()) {
      setSvg("");
      return;
    }

    renderPeleSvg(definition, { fontSize: DEFAULT_FONT_SIZE })
      .then((renderedSvg) => {
        if (!isCancelled) {
          setSvg(renderedSvg);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setSvg("");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [definition]);

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
};
