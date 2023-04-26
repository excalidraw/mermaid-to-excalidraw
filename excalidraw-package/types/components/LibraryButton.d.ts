import React from "react";
import { AppState } from "../types";
import "./LibraryButton.scss";
export declare const LibraryButton: React.FC<{
    appState: AppState;
    setAppState: React.Component<any, AppState>["setState"];
    isMobile?: boolean;
}>;
