import "./ColorPicker.scss";
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
export declare const getCustomColors: (elements: readonly ExcalidrawElement[], type: "elementBackground" | "elementStroke") => string[];
export declare const ColorPicker: ({ type, color, onChange, label, isActive, setActive, elements, appState, }: {
    type: "canvasBackground" | "elementBackground" | "elementStroke";
    color: string | null;
    onChange: (color: string) => void;
    label: string;
    isActive: boolean;
    setActive: (active: boolean) => void;
    elements: readonly ExcalidrawElement[];
    appState: AppState;
}) => JSX.Element;
