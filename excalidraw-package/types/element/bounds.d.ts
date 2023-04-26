import { ExcalidrawElement, ExcalidrawLinearElement, Arrowhead, NonDeleted } from "./types";
import { Drawable, Op } from "roughjs/bin/core";
export declare type Bounds = readonly [number, number, number, number];
export declare const getElementAbsoluteCoords: (element: ExcalidrawElement, includeBoundText?: boolean) => [number, number, number, number, number, number];
export declare const pointRelativeTo: (element: ExcalidrawElement, absoluteCoords: readonly [number, number]) => readonly [number, number];
export declare const getDiamondPoints: (element: ExcalidrawElement) => number[];
export declare const getCurvePathOps: (shape: Drawable) => Op[];
export declare const getMinMaxXYFromCurvePathOps: (ops: Op[], transformXY?: ((x: number, y: number) => [number, number]) | undefined) => [number, number, number, number];
export declare const getArrowheadPoints: (element: ExcalidrawLinearElement, shape: Drawable[], position: "start" | "end", arrowhead: Arrowhead) => number[] | null;
export declare const getElementBounds: (element: ExcalidrawElement) => [number, number, number, number];
export declare const getCommonBounds: (elements: readonly ExcalidrawElement[]) => [number, number, number, number];
export declare const getResizedElementAbsoluteCoords: (element: ExcalidrawElement, nextWidth: number, nextHeight: number, normalizePoints: boolean) => [number, number, number, number];
export declare const getElementPointsCoords: (element: ExcalidrawLinearElement, points: readonly (readonly [number, number])[]) => [number, number, number, number];
export declare const getClosestElementBounds: (elements: readonly ExcalidrawElement[], from: {
    x: number;
    y: number;
}) => [number, number, number, number];
export interface Box {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    midX: number;
    midY: number;
    width: number;
    height: number;
}
export declare const getCommonBoundingBox: (elements: ExcalidrawElement[] | readonly NonDeleted<ExcalidrawElement>[]) => Box;
