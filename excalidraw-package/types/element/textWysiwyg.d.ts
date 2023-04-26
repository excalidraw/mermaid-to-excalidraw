import { ExcalidrawElement, ExcalidrawTextElement, ExcalidrawTextContainer } from "./types";
import App from "../components/App";
export declare const updateOriginalContainerCache: (id: ExcalidrawTextContainer["id"], height: ExcalidrawTextContainer["height"]) => {
    height: ExcalidrawTextContainer["height"];
};
export declare const resetOriginalContainerCache: (id: ExcalidrawTextContainer["id"]) => void;
export declare const getOriginalContainerHeightFromCache: (id: ExcalidrawTextContainer["id"]) => number | null;
export declare const textWysiwyg: ({ id, onChange, onSubmit, getViewportCoords, element, canvas, excalidrawContainer, app, }: {
    id: ExcalidrawElement["id"];
    onChange?: ((text: string) => void) | undefined;
    onSubmit: (data: {
        text: string;
        viaKeyboard: boolean;
        originalText: string;
    }) => void;
    getViewportCoords: (x: number, y: number) => [number, number];
    element: ExcalidrawTextElement;
    canvas: HTMLCanvasElement | null;
    excalidrawContainer: HTMLDivElement | null;
    app: App;
}) => void;
