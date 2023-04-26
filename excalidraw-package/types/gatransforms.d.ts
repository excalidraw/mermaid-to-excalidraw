import { Line, Direction, Point } from "./ga";
/**
 * TODO: docs
 */
export declare const rotation: (pivot: readonly [number, number, number, number, number, number, number, number], angle: number) => readonly [number, number, number, number, number, number, number, number];
export declare const translation: (direction: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const translationOrthogonal: (direction: readonly [number, number, number, number, number, number, number, number], distance: number) => readonly [number, number, number, number, number, number, number, number];
export declare const translationAlong: (line: readonly [number, number, number, number, number, number, number, number], distance: number) => readonly [number, number, number, number, number, number, number, number];
export declare const compose: (motor1: readonly [number, number, number, number, number, number, number, number], motor2: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const apply: (motor: readonly [number, number, number, number, number, number, number, number], nvector: Point | Direction | Line) => Point | Direction | Line;
