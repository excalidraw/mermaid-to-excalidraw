import { MermaidConfig } from "../index.js";
import { MermaidToExcalidrawResult } from "../interfaces.js";
import { Flowchart } from "../parser/flowchart.js";
import { Sequence } from "../parser/sequence.js";

export class GraphConverter<T = Flowchart | Sequence> {
  private converter;
  constructor({
    converter,
  }: {
    converter: (graph: T, options: MermaidConfig) => MermaidToExcalidrawResult;
  }) {
    this.converter = converter;
  }
  convert = (graph: T, options: MermaidConfig) => {
    return this.converter(graph, options);
  };
}
