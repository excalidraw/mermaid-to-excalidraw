import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types";
import { ArrayElement } from "./utils/types";
import {
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
} from "@excalidraw/excalidraw/types/element/types";
import { Mutable } from "@excalidraw/excalidraw/types/utility-types";

export type ExcalidrawElement = Mutable<
  ArrayElement<ImportedDataState["elements"]>
>;

export type ExcalidrawVertexElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement;
