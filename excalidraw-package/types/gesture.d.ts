import { PointerCoords } from "./types";
export declare const getCenter: (pointers: Map<number, PointerCoords>) => {
    x: number;
    y: number;
};
export declare const getDistance: ([a, b]: readonly PointerCoords[]) => number;
