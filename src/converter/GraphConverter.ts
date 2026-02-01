import { ExcalidrawConfig } from "../index.js";
import { DEFAULT_FONT_SIZE } from "../constants.js";
import { MermaidToExcalidrawResult } from "../interfaces.js";
import { Flowchart } from "../parser/flowchart.js";
import { Sequence } from "../parser/sequence.js";
import { Class } from "../parser/class.js";
import { ER } from "../parser/er.js";

export class GraphConverter<T = Flowchart | Sequence | Class | ER> {
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
