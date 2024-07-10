import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types.js";
import {
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
} from "@excalidraw/excalidraw/types/element/types.js";
import { Mutable } from "@excalidraw/excalidraw/types/utility-types.js";

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type ExcalidrawElement = Mutable<
  ArrayElement<ImportedDataState["elements"]>
>;

export type ExcalidrawVertexElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement;
