import { ExcalidrawElement, NonDeletedExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const getElementsWithinSelection: (elements: readonly NonDeletedExcalidrawElement[], selection: NonDeletedExcalidrawElement) => NonDeletedExcalidrawElement[];
export declare const isSomeElementSelected: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState) => boolean;
/**
 * Returns common attribute (picked by `getAttribute` callback) of selected
 *  elements. If elements don't share the same value, returns `null`.
 */
export declare const getCommonAttributeOfSelectedElements: <T>(elements: readonly NonDeletedExcalidrawElement[], appState: AppState, getAttribute: (element: ExcalidrawElement) => T) => T | null;
export declare const getSelectedElements: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState, includeBoundTextElement?: boolean) => NonDeletedExcalidrawElement[];
export declare const getTargetElements: (elements: readonly NonDeletedExcalidrawElement[], appState: AppState) => NonDeletedExcalidrawElement[];
