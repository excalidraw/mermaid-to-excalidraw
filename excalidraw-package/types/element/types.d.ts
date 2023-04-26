import { Point } from "../types";
import { FONT_FAMILY, ROUNDNESS, TEXT_ALIGN, THEME, VERTICAL_ALIGN } from "../constants";
import { MarkNonNullable, ValueOf } from "../utility-types";
export declare type ChartType = "bar" | "line";
export declare type FillStyle = "hachure" | "cross-hatch" | "solid" | "zigzag";
export declare type FontFamilyKeys = keyof typeof FONT_FAMILY;
export declare type FontFamilyValues = typeof FONT_FAMILY[FontFamilyKeys];
export declare type Theme = typeof THEME[keyof typeof THEME];
export declare type FontString = string & {
    _brand: "fontString";
};
export declare type GroupId = string;
export declare type PointerType = "mouse" | "pen" | "touch";
export declare type StrokeRoundness = "round" | "sharp";
export declare type RoundnessType = ValueOf<typeof ROUNDNESS>;
export declare type StrokeStyle = "solid" | "dashed" | "dotted";
export declare type TextAlign = typeof TEXT_ALIGN[keyof typeof TEXT_ALIGN];
declare type VerticalAlignKeys = keyof typeof VERTICAL_ALIGN;
export declare type VerticalAlign = typeof VERTICAL_ALIGN[VerticalAlignKeys];
declare type _ExcalidrawElementBase = Readonly<{
    id: string;
    x: number;
    y: number;
    strokeColor: string;
    backgroundColor: string;
    fillStyle: FillStyle;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    roundness: null | {
        type: RoundnessType;
        value?: number;
    };
    roughness: number;
    opacity: number;
    width: number;
    height: number;
    angle: number;
    /** Random integer used to seed shape generation so that the roughjs shape
        doesn't differ across renders. */
    seed: number;
    /** Integer that is sequentially incremented on each change. Used to reconcile
        elements during collaboration or when saving to server. */
    version: number;
    /** Random integer that is regenerated on each change.
        Used for deterministic reconciliation of updates during collaboration,
        in case the versions (see above) are identical. */
    versionNonce: number;
    isDeleted: boolean;
    /** List of groups the element belongs to.
        Ordered from deepest to shallowest. */
    groupIds: readonly GroupId[];
    /** other elements that are bound to this element */
    boundElements: readonly Readonly<{
        id: ExcalidrawLinearElement["id"];
        type: "arrow" | "text";
    }>[] | null;
    /** epoch (ms) timestamp of last element update */
    updated: number;
    link: string | null;
    locked: boolean;
    customData?: Record<string, any>;
}>;
export declare type ExcalidrawSelectionElement = _ExcalidrawElementBase & {
    type: "selection";
};
export declare type ExcalidrawRectangleElement = _ExcalidrawElementBase & {
    type: "rectangle";
};
export declare type ExcalidrawDiamondElement = _ExcalidrawElementBase & {
    type: "diamond";
};
export declare type ExcalidrawEllipseElement = _ExcalidrawElementBase & {
    type: "ellipse";
};
export declare type ExcalidrawImageElement = _ExcalidrawElementBase & Readonly<{
    type: "image";
    fileId: FileId | null;
    /** whether respective file is persisted */
    status: "pending" | "saved" | "error";
    /** X and Y scale factors <-1, 1>, used for image axis flipping */
    scale: [number, number];
}>;
export declare type InitializedExcalidrawImageElement = MarkNonNullable<ExcalidrawImageElement, "fileId">;
/**
 * These are elements that don't have any additional properties.
 */
export declare type ExcalidrawGenericElement = ExcalidrawSelectionElement | ExcalidrawRectangleElement | ExcalidrawDiamondElement | ExcalidrawEllipseElement;
/**
 * ExcalidrawElement should be JSON serializable and (eventually) contain
 * no computed data. The list of all ExcalidrawElements should be shareable
 * between peers and contain no state local to the peer.
 */
export declare type ExcalidrawElement = ExcalidrawGenericElement | ExcalidrawTextElement | ExcalidrawLinearElement | ExcalidrawFreeDrawElement | ExcalidrawImageElement;
export declare type NonDeleted<TElement extends ExcalidrawElement> = TElement & {
    isDeleted: boolean;
};
export declare type NonDeletedExcalidrawElement = NonDeleted<ExcalidrawElement>;
export declare type ExcalidrawTextElement = _ExcalidrawElementBase & Readonly<{
    type: "text";
    fontSize: number;
    fontFamily: FontFamilyValues;
    text: string;
    baseline: number;
    textAlign: TextAlign;
    verticalAlign: VerticalAlign;
    containerId: ExcalidrawGenericElement["id"] | null;
    originalText: string;
    /**
     * Unitless line height (aligned to W3C). To get line height in px, multiply
     *  with font size (using `getLineHeightInPx` helper).
     */
    lineHeight: number & {
        _brand: "unitlessLineHeight";
    };
}>;
export declare type ExcalidrawBindableElement = ExcalidrawRectangleElement | ExcalidrawDiamondElement | ExcalidrawEllipseElement | ExcalidrawTextElement | ExcalidrawImageElement;
export declare type ExcalidrawTextContainer = ExcalidrawRectangleElement | ExcalidrawDiamondElement | ExcalidrawEllipseElement | ExcalidrawImageElement | ExcalidrawArrowElement;
export declare type ExcalidrawTextElementWithContainer = {
    containerId: ExcalidrawTextContainer["id"];
} & ExcalidrawTextElement;
export declare type PointBinding = {
    elementId: ExcalidrawBindableElement["id"];
    focus: number;
    gap: number;
};
export declare type Arrowhead = "arrow" | "bar" | "dot" | "triangle";
export declare type ExcalidrawLinearElement = _ExcalidrawElementBase & Readonly<{
    type: "line" | "arrow";
    points: readonly Point[];
    lastCommittedPoint: Point | null;
    startBinding: PointBinding | null;
    endBinding: PointBinding | null;
    startArrowhead: Arrowhead | null;
    endArrowhead: Arrowhead | null;
}>;
export declare type ExcalidrawArrowElement = ExcalidrawLinearElement & Readonly<{
    type: "arrow";
}>;
export declare type ExcalidrawFreeDrawElement = _ExcalidrawElementBase & Readonly<{
    type: "freedraw";
    points: readonly Point[];
    pressures: readonly number[];
    simulatePressure: boolean;
    lastCommittedPoint: Point | null;
}>;
export declare type FileId = string & {
    _brand: "FileId";
};
export {};
