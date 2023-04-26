import React from "react";
import { Action, UpdaterFn, ActionName, ActionResult, PanelComponentProps, ActionSource } from "./types";
import { ExcalidrawElement } from "../element/types";
import { AppClassProperties, AppState } from "../types";
export declare class ActionManager {
    actions: Record<ActionName, Action>;
    updater: (actionResult: ActionResult | Promise<ActionResult>) => void;
    getAppState: () => Readonly<AppState>;
    getElementsIncludingDeleted: () => readonly ExcalidrawElement[];
    app: AppClassProperties;
    constructor(updater: UpdaterFn, getAppState: () => AppState, getElementsIncludingDeleted: () => readonly ExcalidrawElement[], app: AppClassProperties);
    registerAction(action: Action): void;
    registerAll(actions: readonly Action[]): void;
    handleKeyDown(event: React.KeyboardEvent | KeyboardEvent): boolean;
    executeAction(action: Action, source?: ActionSource): void;
    /**
     * @param data additional data sent to the PanelComponent
     */
    renderAction: (name: ActionName, data?: PanelComponentProps["data"]) => JSX.Element | null;
    isActionEnabled: (action: Action) => boolean;
}
