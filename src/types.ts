import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types";
import { ArrayElement, Mutable } from "./utils/types";
import {
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
} from "@excalidraw/excalidraw/types/element/types";

export type ExcalidrawElement = Mutable<
  ArrayElement<ImportedDataState["elements"]>
>;

export type ExcalidrawVertexElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement;
