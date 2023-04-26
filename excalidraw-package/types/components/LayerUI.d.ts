import React from "react";
import { ActionManager } from "../actions/manager";
import { NonDeletedExcalidrawElement } from "../element/types";
import { Language } from "../i18n";
import { AppProps, AppState, ExcalidrawProps, BinaryFiles } from "../types";
import Library from "../data/library";
import "./LayerUI.scss";
import "./Toolbar.scss";
interface LayerUIProps {
    actionManager: ActionManager;
    appState: AppState;
    files: BinaryFiles;
    canvas: HTMLCanvasElement | null;
    setAppState: React.Component<any, AppState>["setState"];
    elements: readonly NonDeletedExcalidrawElement[];
    onLockToggle: () => void;
    onHandToolToggle: () => void;
    onPenModeToggle: () => void;
    onInsertElements: (elements: readonly NonDeletedExcalidrawElement[]) => void;
    showExitZenModeBtn: boolean;
    langCode: Language["code"];
    renderTopRightUI?: ExcalidrawProps["renderTopRightUI"];
    renderCustomStats?: ExcalidrawProps["renderCustomStats"];
    renderCustomSidebar?: ExcalidrawProps["renderSidebar"];
    libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
    UIOptions: AppProps["UIOptions"];
    focusContainer: () => void;
    library: Library;
    id: string;
    onImageAction: (data: {
        insertOnCanvasDirectly: boolean;
    }) => void;
    renderWelcomeScreen: boolean;
    children?: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<({ actionManager, appState, files, setAppState, elements, canvas, onLockToggle, onHandToolToggle, onPenModeToggle, onInsertElements, showExitZenModeBtn, renderTopRightUI, renderCustomStats, renderCustomSidebar, libraryReturnUrl, UIOptions, focusContainer, library, id, onImageAction, renderWelcomeScreen, children, }: LayerUIProps) => JSX.Element>;
export default _default;
