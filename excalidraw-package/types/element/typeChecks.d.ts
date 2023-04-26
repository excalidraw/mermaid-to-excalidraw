import { AppState } from "../types";
import { MarkNonNullable } from "../utility-types";
import { ExcalidrawElement, ExcalidrawTextElement, ExcalidrawLinearElement, ExcalidrawBindableElement, ExcalidrawGenericElement, ExcalidrawFreeDrawElement, InitializedExcalidrawImageElement, ExcalidrawImageElement, ExcalidrawTextElementWithContainer, ExcalidrawTextContainer, RoundnessType } from "./types";
export declare const isGenericElement: (element: ExcalidrawElement | null) => element is ExcalidrawGenericElement;
export declare const isInitializedImageElement: (element: ExcalidrawElement | null) => element is InitializedExcalidrawImageElement;
export declare const isImageElement: (element: ExcalidrawElement | null) => element is ExcalidrawImageElement;
export declare const isTextElement: (element: ExcalidrawElement | null) => element is ExcalidrawTextElement;
export declare const isFreeDrawElement: (element?: ExcalidrawElement | null) => element is ExcalidrawFreeDrawElement;
export declare const isFreeDrawElementType: (elementType: ExcalidrawElement["type"]) => boolean;
export declare const isLinearElement: (element?: ExcalidrawElement | null) => element is ExcalidrawLinearElement;
export declare const isArrowElement: (element?: ExcalidrawElement | null) => element is ExcalidrawLinearElement;
export declare const isLinearElementType: (elementType: AppState["activeTool"]["type"]) => boolean;
export declare const isBindingElement: (element?: ExcalidrawElement | null, includeLocked?: boolean) => element is ExcalidrawLinearElement;
export declare const isBindingElementType: (elementType: AppState["activeTool"]["type"]) => boolean;
export declare const isBindableElement: (element: ExcalidrawElement | null, includeLocked?: boolean) => element is ExcalidrawBindableElement;
export declare const isTextBindableContainer: (element: ExcalidrawElement | null, includeLocked?: boolean) => element is ExcalidrawTextContainer;
export declare const isExcalidrawElement: (element: any) => boolean;
export declare const hasBoundTextElement: (element: ExcalidrawElement | null) => element is MarkNonNullable<ExcalidrawBindableElement, "boundElements">;
export declare const isBoundToContainer: (element: ExcalidrawElement | null) => element is ExcalidrawTextElementWithContainer;
export declare const isUsingAdaptiveRadius: (type: string) => boolean;
export declare const isUsingProportionalRadius: (type: string) => boolean;
export declare const canApplyRoundnessTypeToElement: (roundnessType: RoundnessType, element: ExcalidrawElement) => boolean;
export declare const getDefaultRoundnessTypeForElement: (element: ExcalidrawElement) => {
    type: 2;
} | {
    type: 3;
} | null;
