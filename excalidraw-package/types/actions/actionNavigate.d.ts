export declare const actionGoToCollaborator: {
    name: "goToCollaborator";
    viewMode: true;
    trackEvent: {
        category: "collab";
    };
    perform: (_elements: readonly import("../element/types").ExcalidrawElement[], appState: Readonly<import("../types").AppState>, value: any) => {
        appState: Readonly<import("../types").AppState>;
        commitToHistory: false;
    };
    PanelComponent: ({ appState, updateData, data }: import("./types").PanelComponentProps) => JSX.Element;
} & {
    keyTest?: undefined;
};
