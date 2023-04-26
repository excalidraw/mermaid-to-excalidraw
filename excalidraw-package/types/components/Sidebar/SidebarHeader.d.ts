/// <reference types="react" />
export declare const SidebarDockButton: (props: {
    checked: boolean;
    onChange?(): void;
}) => JSX.Element;
/** @private */
export declare const SidebarHeaderComponents: {
    Context: import("react").FC<{
        children: import("react").ReactNode;
    }>;
    Component: {
        (props: {
            children?: React.ReactNode;
            className?: string | undefined;
        } & {
            __isFallback?: boolean | undefined;
        }): JSX.Element | null;
        displayName: string;
    };
};
