import { Point } from "./types";
export declare const getSizeFromPoints: (points: readonly Point[]) => {
    width: number;
    height: number;
};
/** @arg dimension, 0 for rescaling only x, 1 for y */
export declare const rescalePoints: (dimension: 0 | 1, newSize: number, points: readonly Point[], normalize: boolean) => Point[];
