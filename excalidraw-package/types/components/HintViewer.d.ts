import { NonDeletedExcalidrawElement } from "../element/types";
import "./HintViewer.scss";
import { AppState, Device } from "../types";
interface HintViewerProps {
    appState: AppState;
    elements: readonly NonDeletedExcalidrawElement[];
    isMobile: boolean;
    device: Device;
}
export declare const HintViewer: ({ appState, elements, isMobile, device, }: HintViewerProps) => JSX.Element | null;
export {};
