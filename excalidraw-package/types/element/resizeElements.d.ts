import { ExcalidrawLinearElement, NonDeletedExcalidrawElement, NonDeleted } from "./types";
import { MaybeTransformHandleType, TransformHandleDirection } from "./transformHandles";
import { PointerDownState } from "../types";
export declare const normalizeAngle: (angle: number) => number;
export declare const transformElements: (pointerDownState: PointerDownState, transformHandleType: MaybeTransformHandleType, selectedElements: readonly NonDeletedExcalidrawElement[], resizeArrowDirection: "origin" | "end", shouldRotateWithDiscreteAngle: boolean, shouldResizeFromCenter: boolean, shouldMaintainAspectRatio: boolean, pointerX: number, pointerY: number, centerX: number, centerY: number) => boolean;
export declare const resizeSingleElement: (originalElements: PointerDownState["originalElements"], shouldMaintainAspectRatio: boolean, element: NonDeletedExcalidrawElement, transformHandleDirection: TransformHandleDirection, shouldResizeFromCenter: boolean, pointerX: number, pointerY: number) => void;
export declare const getResizeOffsetXY: (transformHandleType: MaybeTransformHandleType, selectedElements: NonDeletedExcalidrawElement[], x: number, y: number) => [number, number];
export declare const getResizeArrowDirection: (transformHandleType: MaybeTransformHandleType, element: NonDeleted<ExcalidrawLinearElement>) => "origin" | "end";
