import { DEFAULT_FONT_SIZE } from "../constants";
import {
  Graph,
  GraphToExcalidrawOptions,
  GraphToExcalidrawResult,
} from "../interfaces";

export class GraphConverter<T = Graph> {
  private converter;
  constructor({
    converter,
  }: {
    converter: (
      graph: T,
      options: Required<GraphToExcalidrawOptions>
    ) => GraphToExcalidrawResult;
  }) {
    this.converter = converter;
  }
  convert = (graph: T, options: GraphToExcalidrawOptions) => {
    return this.converter(graph, {
      ...options,
      fontSize: options.fontSize || DEFAULT_FONT_SIZE,
    });
  };
}
