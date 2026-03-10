import type { ImportedDataState } from "@excalidraw/excalidraw/data/types";
import type {
  ExcalidrawRectangleElement,
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
} from "@excalidraw/excalidraw/element/types";
import type { Mutable } from "@excalidraw/excalidraw/common/utility-types";

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type ExcalidrawElement = Mutable<
  ArrayElement<ImportedDataState["elements"]>
>;

export type ExcalidrawVertexElement =
  | ExcalidrawRectangleElement
  | ExcalidrawDiamondElement
  | ExcalidrawEllipseElement;
