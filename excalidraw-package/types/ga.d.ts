/**
 * This is a 2D Projective Geometric Algebra implementation.
 *
 * For wider context on geometric algebra visit see https://bivector.net.
 *
 * For this specific algebra see cheatsheet https://bivector.net/2DPGA.pdf.
 *
 * Converted from generator written by enki, with a ton of added on top.
 *
 * This library uses 8-vectors to represent points, directions and lines
 * in 2D space.
 *
 * An array `[a, b, c, d, e, f, g, h]` represents a n(8)vector:
 *   a + b*e0 + c*e1 + d*e2 + e*e01 + f*e20 + g*e12 + h*e012
 *
 * See GAPoint, GALine, GADirection and GATransform modules for common
 * operations.
 */
export declare type Point = NVector;
export declare type Direction = NVector;
export declare type Line = NVector;
export declare type Transform = NVector;
export declare const point: (x: number, y: number) => NVector;
export declare const origin: () => NVector;
export declare const direction: (x: number, y: number) => NVector;
export declare const offset: (x: number, y: number) => NVector;
declare type NVector = readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
export declare const nvector: (value?: number, index?: number) => NVector;
export declare const toString: (nvector: NVector) => string;
export declare const reverse: (nvector: NVector) => NVector;
export declare const dual: (nvector: NVector) => NVector;
export declare const conjugate: (nvector: NVector) => NVector;
export declare const involute: (nvector: NVector) => NVector;
export declare const add: (a: NVector, b: NVector | number) => NVector;
export declare const sub: (a: NVector, b: NVector | number) => NVector;
export declare const mul: (a: NVector, b: NVector | number) => NVector;
export declare const mulScalar: (a: NVector, b: NVector) => number;
export declare const meet: (a: NVector, b: NVector) => NVector;
export declare const join: (a: NVector, b: NVector) => NVector;
export declare const joinScalar: (a: NVector, b: NVector) => number;
export declare const dot: (a: NVector, b: NVector) => NVector;
export declare const norm: (a: NVector) => number;
export declare const inorm: (a: NVector) => number;
export declare const normalized: (a: NVector) => NVector;
export declare const inormalized: (a: NVector) => NVector;
export declare const E0: NVector;
export declare const E1: NVector;
export declare const E2: NVector;
export declare const E01: NVector;
export declare const E20: NVector;
export declare const E12: NVector;
export declare const E012: NVector;
export declare const I: NVector;
export {};
