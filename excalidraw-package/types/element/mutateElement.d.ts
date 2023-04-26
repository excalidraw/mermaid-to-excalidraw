import { ExcalidrawElement } from "./types";
import { Mutable } from "../utility-types";
declare type ElementUpdate<TElement extends ExcalidrawElement> = Omit<Partial<TElement>, "id" | "version" | "versionNonce">;
export declare const mutateElement: <TElement extends Mutable<ExcalidrawElement>>(element: TElement, updates: ElementUpdate<TElement>, informMutation?: boolean) => TElement;
export declare const newElementWith: <TElement extends ExcalidrawElement>(element: TElement, updates: ElementUpdate<TElement>) => TElement;
/**
 * Mutates element, bumping `version`, `versionNonce`, and `updated`.
 *
 * NOTE: does not trigger re-render.
 */
export declare const bumpVersion: (element: Mutable<ExcalidrawElement>, version?: ExcalidrawElement["version"]) => Mutable<ExcalidrawElement>;
export {};
