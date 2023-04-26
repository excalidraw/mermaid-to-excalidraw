declare type CANVAS_ERROR_NAMES = "CANVAS_ERROR" | "CANVAS_POSSIBLY_TOO_BIG";
export declare class CanvasError extends Error {
    constructor(message?: string, name?: CANVAS_ERROR_NAMES);
}
export declare class AbortError extends DOMException {
    constructor(message?: string);
}
export {};
