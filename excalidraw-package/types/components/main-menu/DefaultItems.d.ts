import "./DefaultItems.scss";
export declare const LoadScene: {
    (): JSX.Element | null;
    displayName: string;
};
export declare const SaveToActiveFile: {
    (): JSX.Element | null;
    displayName: string;
};
export declare const SaveAsImage: {
    (): JSX.Element;
    displayName: string;
};
export declare const Help: {
    (): JSX.Element;
    displayName: string;
};
export declare const ClearCanvas: {
    (): JSX.Element | null;
    displayName: string;
};
export declare const ToggleTheme: {
    (): JSX.Element | null;
    displayName: string;
};
export declare const ChangeCanvasBackground: {
    (): JSX.Element | null;
    displayName: string;
};
export declare const Export: {
    (): JSX.Element;
    displayName: string;
};
export declare const Socials: {
    (): JSX.Element;
    displayName: string;
};
export declare const LiveCollaborationTrigger: {
    ({ onSelect, isCollaborating, }: {
        onSelect: () => void;
        isCollaborating: boolean;
    }): JSX.Element;
    displayName: string;
};
