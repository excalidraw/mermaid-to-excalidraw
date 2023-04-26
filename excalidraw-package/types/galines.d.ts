/**
 * A line is stored as an array `[0, c, a, b, 0, 0, 0, 0]` representing:
 *   c * e0 + a * e1 + b*e2
 *
 * This maps to a standard formula `a * x + b * y + c`.
 *
 * `(-b, a)` corresponds to a 2D vector parallel to the line. The lines
 * have a natural orientation, corresponding to that vector.
 *
 * The magnitude ("norm") of the line is `sqrt(a ^ 2 + b ^ 2)`.
 * `c / norm(line)` is the oriented distance from line to origin.
 */
export declare const vector: (x: number, y: number) => readonly [number, number, number, number, number, number, number, number];
export declare const equation: (a: number, b: number, c: number) => readonly [number, number, number, number, number, number, number, number];
export declare const through: (from: readonly [number, number, number, number, number, number, number, number], to: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const orthogonal: (line: readonly [number, number, number, number, number, number, number, number], point: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const orthogonalThrough: (against: readonly [number, number, number, number, number, number, number, number], intersection: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const parallel: (line: readonly [number, number, number, number, number, number, number, number], distance: number) => readonly [number, number, number, number, number, number, number, number];
export declare const parallelThrough: (line: readonly [number, number, number, number, number, number, number, number], point: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const distance: (line1: readonly [number, number, number, number, number, number, number, number], line2: readonly [number, number, number, number, number, number, number, number]) => number;
export declare const angle: (line1: readonly [number, number, number, number, number, number, number, number], line2: readonly [number, number, number, number, number, number, number, number]) => number;
export declare const sign: (line: readonly [number, number, number, number, number, number, number, number]) => number;
