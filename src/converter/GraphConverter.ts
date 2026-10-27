import { ExcalidrawConfig } from "../index.js";
import { DEFAULT_FONT_SIZE } from "../constants.js";
import {
  MermaidToExcalidrawResult,
  Flowchart,
  Sequence,
} from "../interfaces.js";

export class GraphConverter<T = Flowchart | Sequence> {
  private converter;
  constructor({
    converter,
  }: {
    converter: (
      graph: T,
      config: Required<ExcalidrawConfig>
    ) => MermaidToExcalidrawResult;
  }) {
    this.converter = converter;
  }
  convert = (graph: T, config: ExcalidrawConfig) => {
    return this.converter(graph, {
      ...config,
      fontSize: config.fontSize || DEFAULT_FONT_SIZE,
    });
  };
}
