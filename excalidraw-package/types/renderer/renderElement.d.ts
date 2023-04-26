import { ExcalidrawElement, ExcalidrawTextElement, NonDeletedExcalidrawElement, ExcalidrawFreeDrawElement } from "../element/types";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable, Options } from "roughjs/bin/core";
import { RoughSVG } from "roughjs/bin/svg";
import { RenderConfig } from "../scene/types";
import { AppState, BinaryFiles } from "../types";
export interface ExcalidrawElementWithCanvas {
    element: ExcalidrawElement | ExcalidrawTextElement;
    canvas: HTMLCanvasElement;
    theme: RenderConfig["theme"];
    scale: number;
    zoomValue: RenderConfig["zoom"]["value"];
    canvasOffsetX: number;
    canvasOffsetY: number;
    boundTextElementVersion: number | null;
}
export declare const DEFAULT_LINK_SIZE = 14;
declare type ElementShape = Drawable | Drawable[] | null;
declare type ElementShapes = {
    freedraw: Drawable | null;
    arrow: Drawable[];
    line: Drawable[];
    text: null;
    image: null;
};
export declare const getShapeForElement: <T extends ExcalidrawElement>(element: T) => T["type"] extends keyof ElementShapes ? ElementShapes[T["type"]] | undefined : Drawable | null | undefined;
export declare const setShapeForElement: <T extends ExcalidrawElement>(element: T, shape: T["type"] extends keyof ElementShapes ? ElementShapes[T["type"]] : Drawable) => WeakMap<ExcalidrawElement, ElementShape>;
export declare const invalidateShapeForElement: (element: ExcalidrawElement) => boolean;
export declare const generateRoughOptions: (element: ExcalidrawElement, continuousPath?: boolean) => Options;
export declare const renderElement: (element: NonDeletedExcalidrawElement, rc: RoughCanvas, context: CanvasRenderingContext2D, renderConfig: RenderConfig, appState: AppState) => void;
export declare const renderElementToSvg: (element: NonDeletedExcalidrawElement, rsvg: RoughSVG, svgRoot: SVGElement, files: BinaryFiles, offsetX: number, offsetY: number, exportWithDarkMode?: boolean) => void;
export declare const pathsCache: WeakMap<ExcalidrawFreeDrawElement, Path2D>;
export declare function generateFreeDrawShape(element: ExcalidrawFreeDrawElement): Path2D;
export declare function getFreeDrawPath2D(element: ExcalidrawFreeDrawElement): Path2D | undefined;
export declare function getFreeDrawSvgPath(element: ExcalidrawFreeDrawElement): string;
export {};
