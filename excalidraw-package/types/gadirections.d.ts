/**
 * A direction is stored as an array `[0, 0, 0, 0, y, x, 0, 0]` representing
 * vector `(x, y)`.
 */
export declare const from: (point: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const fromTo: (from: readonly [number, number, number, number, number, number, number, number], to: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const orthogonal: (direction: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
export declare const orthogonalToLine: (line: readonly [number, number, number, number, number, number, number, number]) => readonly [number, number, number, number, number, number, number, number];
