import { NonDeletedExcalidrawElement } from "./types";
import { AppState, PointerDownState } from "../types";
export declare const dragSelectedElements: (pointerDownState: PointerDownState, selectedElements: NonDeletedExcalidrawElement[], pointerX: number, pointerY: number, lockDirection: boolean | undefined, distanceX: number | undefined, distanceY: number | undefined, appState: AppState) => void;
export declare const getDragOffsetXY: (selectedElements: NonDeletedExcalidrawElement[], x: number, y: number) => [number, number];
export declare const dragNewElement: (draggingElement: NonDeletedExcalidrawElement, elementType: AppState["activeTool"]["type"], originX: number, originY: number, x: number, y: number, width: number, height: number, shouldMaintainAspectRatio: boolean, shouldResizeFromCenter: boolean, widthAspectRatio?: number | null) => void;
