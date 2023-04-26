import React from "react";
import { AppState, Device, ExcalidrawProps } from "../types";
import { ActionManager } from "../actions/manager";
import { NonDeletedExcalidrawElement } from "../element/types";
declare type MobileMenuProps = {
    appState: AppState;
    actionManager: ActionManager;
    renderJSONExportDialog: () => React.ReactNode;
    renderImageExportDialog: () => React.ReactNode;
    setAppState: React.Component<any, AppState>["setState"];
    elements: readonly NonDeletedExcalidrawElement[];
    onLockToggle: () => void;
    onHandToolToggle: () => void;
    onPenModeToggle: () => void;
    canvas: HTMLCanvasElement | null;
    onImageAction: (data: {
        insertOnCanvasDirectly: boolean;
    }) => void;
    renderTopRightUI?: (isMobile: boolean, appState: AppState) => JSX.Element | null;
    renderCustomStats?: ExcalidrawProps["renderCustomStats"];
    renderSidebars: () => JSX.Element | null;
    device: Device;
    renderWelcomeScreen: boolean;
};
export declare const MobileMenu: ({ appState, elements, actionManager, setAppState, onLockToggle, onHandToolToggle, onPenModeToggle, canvas, onImageAction, renderTopRightUI, renderCustomStats, renderSidebars, device, renderWelcomeScreen, }: MobileMenuProps) => JSX.Element;
export {};
