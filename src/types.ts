import { ImportedDataState } from "@excalidraw/excalidraw/types/data/types";
import { ArrayElement, Mutable } from "./utils/types";

export type ExcalidrawElement = Mutable<
  ArrayElement<ImportedDataState["elements"]>
>;
