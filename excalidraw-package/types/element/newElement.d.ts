import { ExcalidrawElement, ExcalidrawImageElement, ExcalidrawTextElement, ExcalidrawLinearElement, ExcalidrawGenericElement, NonDeleted, TextAlign, GroupId, VerticalAlign, Arrowhead, ExcalidrawFreeDrawElement, FontFamilyValues, ExcalidrawTextContainer } from "../element/types";
import { AppState } from "../types";
import { MarkOptional, Mutable } from "../utility-types";
declare type ElementConstructorOpts = MarkOptional<Omit<ExcalidrawGenericElement, "id" | "type" | "isDeleted" | "updated">, "width" | "height" | "angle" | "groupIds" | "boundElements" | "seed" | "version" | "versionNonce" | "link" | "strokeStyle" | "fillStyle" | "strokeColor" | "backgroundColor" | "roughness" | "strokeWidth" | "roundness" | "locked" | "opacity">;
export declare const newElement: (opts: {
    type: ExcalidrawGenericElement["type"];
} & ElementConstructorOpts) => NonDeleted<ExcalidrawGenericElement>;
export declare const newTextElement: (opts: {
    text: string;
    fontSize?: number;
    fontFamily?: FontFamilyValues;
    textAlign?: TextAlign;
    verticalAlign?: VerticalAlign;
    containerId?: ExcalidrawTextContainer["id"];
    lineHeight?: ExcalidrawTextElement["lineHeight"];
    strokeWidth?: ExcalidrawTextElement["strokeWidth"];
} & ElementConstructorOpts) => NonDeleted<ExcalidrawTextElement>;
export declare const refreshTextDimensions: (textElement: ExcalidrawTextElement, text?: string) => {
    x: number;
    y: number;
    width: number;
    height: number;
    baseline: number;
    text: string;
} | undefined;
export declare const updateTextElement: (textElement: ExcalidrawTextElement, { text, isDeleted, originalText, }: {
    text: string;
    isDeleted?: boolean | undefined;
    originalText: string;
}) => ExcalidrawTextElement;
export declare const newFreeDrawElement: (opts: {
    type: "freedraw";
    points?: ExcalidrawFreeDrawElement["points"];
    simulatePressure: boolean;
} & ElementConstructorOpts) => NonDeleted<ExcalidrawFreeDrawElement>;
export declare const newLinearElement: (opts: {
    type: ExcalidrawLinearElement["type"];
    startArrowhead: Arrowhead | null;
    endArrowhead: Arrowhead | null;
    points?: ExcalidrawLinearElement["points"];
} & ElementConstructorOpts) => NonDeleted<ExcalidrawLinearElement>;
export declare const newImageElement: (opts: {
    type: ExcalidrawImageElement["type"];
    status?: ExcalidrawImageElement["status"];
    fileId?: ExcalidrawImageElement["fileId"];
    scale?: ExcalidrawImageElement["scale"];
} & ElementConstructorOpts) => NonDeleted<ExcalidrawImageElement>;
/**
 * Clones ExcalidrawElement data structure. Does not regenerate id, nonce, or
 * any value. The purpose is to to break object references for immutability
 * reasons, whenever we want to keep the original element, but ensure it's not
 * mutated.
 *
 * Only clones plain objects and arrays. Doesn't clone Date, RegExp, Map, Set,
 * Typed arrays and other non-null objects.
 */
export declare const deepCopyElement: <T extends ExcalidrawElement>(val: T) => Mutable<T>;
/**
 * Duplicate an element, often used in the alt-drag operation.
 * Note that this method has gotten a bit complicated since the
 * introduction of gruoping/ungrouping elements.
 * @param editingGroupId The current group being edited. The new
 *                       element will inherit this group and its
 *                       parents.
 * @param groupIdMapForOperation A Map that maps old group IDs to
 *                               duplicated ones. If you are duplicating
 *                               multiple elements at once, share this map
 *                               amongst all of them
 * @param element Element to duplicate
 * @param overrides Any element properties to override
 */
export declare const duplicateElement: <TElement extends ExcalidrawElement>(editingGroupId: AppState["editingGroupId"], groupIdMapForOperation: Map<GroupId, GroupId>, element: TElement, overrides?: Partial<TElement> | undefined) => Readonly<TElement>;
/**
 * Clones elements, regenerating their ids (including bindings) and group ids.
 *
 * If bindings don't exist in the elements array, they are removed. Therefore,
 * it's advised to supply the whole elements array, or sets of elements that
 * are encapsulated (such as library items), if the purpose is to retain
 * bindings to the cloned elements intact.
 *
 * NOTE by default does not randomize or regenerate anything except the id.
 */
export declare const duplicateElements: (elements: readonly ExcalidrawElement[], opts?: {
    /** NOTE also updates version flags and `updated` */
    randomizeSeed: boolean;
}) => ExcalidrawElement[];
export {};
