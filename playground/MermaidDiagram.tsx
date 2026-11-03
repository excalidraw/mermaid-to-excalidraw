import { useEffect, useState } from "react";
import { renderPeleSvg } from "../src/pele/parsePele.ts";
import { DEFAULT_FONT_SIZE } from "../src/constants.ts";
import { useMermaidConfig } from "./mermaidConfig.ts";

interface MermaidProps {
  definition: string;
}

/** The diagram as Pele lays it out for conversion. */
export const MermaidDiagram = ({ definition }: MermaidProps) => {
  const [svg, setSvg] = useState("");
  const config = useMermaidConfig();
  const curve = config.flowchart?.curve;
  const elbow = config.elbow;

  useEffect(() => {
    let isCancelled = false;

    if (!definition.trim()) {
      setSvg("");
      return;
    }

    renderPeleSvg(definition, { fontSize: DEFAULT_FONT_SIZE, curve, elbow })
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
  }, [definition, curve, elbow]);

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
};
