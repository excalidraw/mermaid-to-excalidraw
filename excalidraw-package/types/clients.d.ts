import { AppState } from "./types";
export declare const getClientColors: (clientId: string, appState: AppState) => {
    background: string;
    stroke: string;
};
export declare const getClientInitials: (userName?: string | null) => string;
