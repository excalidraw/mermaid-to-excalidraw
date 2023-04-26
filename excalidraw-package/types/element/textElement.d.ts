import { ExcalidrawElement, ExcalidrawTextContainer, ExcalidrawTextElement, ExcalidrawTextElementWithContainer, FontFamilyValues, FontString, NonDeletedExcalidrawElement } from "./types";
import { MaybeTransformHandleType } from "./transformHandles";
import { AppState } from "../types";
import { ExtractSetType } from "../utility-types";
export declare const normalizeText: (text: string) => string;
export declare const splitIntoLines: (text: string) => string[];
export declare const redrawTextBoundingBox: (textElement: ExcalidrawTextElement, container: ExcalidrawElement | null) => void;
export declare const bindTextToShapeAfterDuplication: (sceneElements: ExcalidrawElement[], oldElements: ExcalidrawElement[], oldIdToDuplicatedId: Map<ExcalidrawElement["id"], ExcalidrawElement["id"]>) => void;
export declare const handleBindTextResize: (container: NonDeletedExcalidrawElement, transformHandleType: MaybeTransformHandleType) => void;
export declare const computeBoundTextPosition: (container: ExcalidrawElement, boundTextElement: ExcalidrawTextElementWithContainer) => {
    x: number;
    y: number;
};
export declare const measureText: (text: string, font: FontString, lineHeight: ExcalidrawTextElement["lineHeight"]) => {
    width: number;
    height: number;
    baseline: number;
};
export declare const measureBaseline: (text: string, font: FontString, lineHeight: ExcalidrawTextElement["lineHeight"], wrapInContainer?: boolean) => number;
/**
 * To get unitless line-height (if unknown) we can calculate it by dividing
 * height-per-line by fontSize.
 */
export declare const detectLineHeight: (textElement: ExcalidrawTextElement) => number & {
    _brand: "unitlessLineHeight";
};
/**
 * We calculate the line height from the font size and the unitless line height,
 * aligning with the W3C spec.
 */
export declare const getLineHeightInPx: (fontSize: ExcalidrawTextElement["fontSize"], lineHeight: ExcalidrawTextElement["lineHeight"]) => number;
export declare const getApproxMinLineHeight: (fontSize: ExcalidrawTextElement["fontSize"], lineHeight: ExcalidrawTextElement["lineHeight"]) => number;
export declare const getTextWidth: (text: string, font: FontString) => number;
export declare const getTextHeight: (text: string, fontSize: number, lineHeight: ExcalidrawTextElement["lineHeight"]) => number;
export declare const parseTokens: (text: string) => string[];
export declare const wrapText: (text: string, font: FontString, maxWidth: number) => string;
export declare const charWidth: {
    calculate: (char: string, font: FontString) => number;
    getCache: (font: FontString) => number[];
};
export declare const getApproxMinLineWidth: (font: FontString, lineHeight: ExcalidrawTextElement["lineHeight"]) => number;
export declare const getMinCharWidth: (font: FontString) => number;
export declare const getMaxCharWidth: (font: FontString) => number;
export declare const getApproxCharsToFitInWidth: (font: FontString, width: number) => number;
export declare const getBoundTextElementId: (container: ExcalidrawElement | null) => string | null;
export declare const getBoundTextElement: (element: ExcalidrawElement | null) => ExcalidrawTextElementWithContainer | null;
export declare const getContainerElement: (element: (ExcalidrawElement & {
    containerId: ExcalidrawElement["id"] | null;
}) | null) => ExcalidrawElement | null;
export declare const getContainerDims: (element: ExcalidrawElement) => {
    width: number;
    height: number;
};
export declare const getContainerCenter: (container: ExcalidrawElement, appState: AppState) => {
    x: number;
    y: number;
};
export declare const getContainerCoords: (container: NonDeletedExcalidrawElement) => {
    x: number;
    y: number;
};
export declare const getTextElementAngle: (textElement: ExcalidrawTextElement) => number;
export declare const getBoundTextElementOffset: (boundTextElement: ExcalidrawTextElement | null) => number;
export declare const getBoundTextElementPosition: (container: ExcalidrawElement, boundTextElement: ExcalidrawTextElementWithContainer) => {
    x: number;
    y: number;
} | undefined;
export declare const shouldAllowVerticalAlign: (selectedElements: NonDeletedExcalidrawElement[]) => boolean;
export declare const suppportsHorizontalAlign: (selectedElements: NonDeletedExcalidrawElement[]) => boolean;
export declare const getTextBindableContainerAtPosition: (elements: readonly ExcalidrawElement[], appState: AppState, x: number, y: number) => ExcalidrawTextContainer | null;
declare const VALID_CONTAINER_TYPES: Set<string>;
export declare const isValidTextContainer: (element: ExcalidrawElement) => boolean;
export declare const computeContainerDimensionForBoundText: (dimension: number, containerType: ExtractSetType<typeof VALID_CONTAINER_TYPES>) => number;
export declare const getMaxContainerWidth: (container: ExcalidrawElement) => number;
export declare const getMaxContainerHeight: (container: ExcalidrawElement) => number;
export declare const isMeasureTextSupported: () => boolean;
export declare const getDefaultLineHeight: (fontFamily: FontFamilyValues) => number & {
    _brand: "unitlessLineHeight";
};
export {};
