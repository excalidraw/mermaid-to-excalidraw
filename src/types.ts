import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types";
import {
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
} from "@excalidraw/excalidraw/types/element/types";
import { Mutable } from "@excalidraw/excalidraw/types/utility-types";

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type ExcalidrawElement = Mutable<
  ArrayElement<ImportedDataState["elements"]>
>;

export type ExcalidrawVertexElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement;
