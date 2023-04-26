import { ExcalidrawTextElement } from "../element/types";
import { AppClassProperties, AppState } from "../types";
export declare type RenderConfig = {
    scrollX: AppState["scrollX"];
    scrollY: AppState["scrollY"];
    /** null indicates transparent bg */
    viewBackgroundColor: AppState["viewBackgroundColor"] | null;
    zoom: AppState["zoom"];
    shouldCacheIgnoreZoom: AppState["shouldCacheIgnoreZoom"];
    theme: AppState["theme"];
    remotePointerViewportCoords: {
        [id: string]: {
            x: number;
            y: number;
        };
    };
    remotePointerButton?: {
        [id: string]: string | undefined;
    };
    remoteSelectedElementIds: {
        [elementId: string]: string[];
    };
    remotePointerUsernames: {
        [id: string]: string;
    };
    remotePointerUserStates: {
        [id: string]: string;
    };
    imageCache: AppClassProperties["imageCache"];
    renderScrollbars?: boolean;
    renderSelection?: boolean;
    renderGrid?: boolean;
    /** when exporting the behavior is slightly different (e.g. we can't use
      CSS filters), and we disable render optimizations for best output */
    isExporting: boolean;
    selectionColor?: string;
};
export declare type SceneScroll = {
    scrollX: number;
    scrollY: number;
};
export interface Scene {
    elements: ExcalidrawTextElement[];
}
export declare type ExportType = "png" | "clipboard" | "clipboard-svg" | "backend" | "svg";
export declare type ScrollBars = {
    horizontal: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    vertical: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
};
