import { ExcalidrawConfig } from "../index.js";
import { MermaidToExcalidrawResult } from "../interfaces.js";
import { Flowchart } from "../parser/flowchart.js";
import { Sequence } from "../parser/sequence.js";

export class GraphConverter<T = Flowchart | Sequence> {
  private converter;
  constructor({
    converter,
  }: {
    converter: (
      graph: T,
      config: ExcalidrawConfig
    ) => MermaidToExcalidrawResult;
  }) {
    this.converter = converter;
  }
  convert = (graph: T, config: ExcalidrawConfig) => {
    return this.converter(graph, config);
  };
}
