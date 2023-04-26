import { ExcalidrawElement } from "../element/types";
import type Scene from "./Scene";
export declare class Fonts {
    private scene;
    private onSceneUpdated;
    constructor({ scene, onSceneUpdated, }: {
        scene: Scene;
        onSceneUpdated: () => void;
    });
    private static loadedFontFaces;
    /**
     * if we load a (new) font, it's likely that text elements using it have
     * already been rendered using a fallback font. Thus, we want invalidate
     * their shapes and rerender. See #637.
     *
     * Invalidates text elements and rerenders scene, provided that at least one
     * of the supplied fontFaces has not already been processed.
     */
    onFontsLoaded: (fontFaces: readonly FontFace[]) => false | undefined;
    loadFontsForElements: (elements: readonly ExcalidrawElement[]) => Promise<void>;
}
