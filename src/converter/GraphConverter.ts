import { MermaidOptions } from "..";
import { DEFAULT_FONT_SIZE } from "../constants";
import { Graph, MermaidToExcalidrawResult } from "../interfaces";

export class GraphConverter<T = Graph> {
  private converter;
  constructor({
    converter,
  }: {
    converter: (
      graph: T,
      options: Required<MermaidOptions>
    ) => MermaidToExcalidrawResult;
  }) {
    this.converter = converter;
  }
  convert = (graph: T, options: MermaidOptions) => {
    return this.converter(graph, {
      ...options,
      fontSize: options.fontSize || DEFAULT_FONT_SIZE,
    });
  };
}
