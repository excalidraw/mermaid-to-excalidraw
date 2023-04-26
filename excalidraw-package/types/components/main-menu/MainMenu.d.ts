import React from "react";
import * as DefaultItems from "./DefaultItems";
declare const MainMenu: React.FC<{
    children?: React.ReactNode;
    /**
     * Called when any menu item is selected (clicked on).
     */
    onSelect?: ((event: Event) => void) | undefined;
} & {
    __fallback?: boolean | undefined;
}> & {
    Trigger: {
        ({ className, children, onToggle, }: {
            className?: string | undefined;
            children: React.ReactNode;
            onToggle: () => void;
        }): JSX.Element;
        displayName: string;
    };
    Item: {
        ({ icon, onSelect, children, shortcut, className, ...rest }: {
            icon?: JSX.Element | undefined;
            onSelect: (event: Event) => void;
            children: React.ReactNode;
            shortcut?: string | undefined;
            className?: string | undefined;
        } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">): JSX.Element;
        displayName: string;
    };
    ItemLink: {
        ({ icon, shortcut, href, children, onSelect, className, ...rest }: {
            href: string;
            icon?: JSX.Element | undefined;
            children: React.ReactNode;
            shortcut?: string | undefined;
            className?: string | undefined;
            onSelect?: ((event: Event) => void) | undefined;
        } & React.AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element;
        displayName: string;
    };
    ItemCustom: ({ children, className, ...rest }: {
        children: React.ReactNode;
        className?: string | undefined;
    } & React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    Group: {
        ({ children, className, style, title, }: {
            children: React.ReactNode;
            className?: string | undefined;
            style?: React.CSSProperties | undefined;
            title?: string | undefined;
        }): JSX.Element;
        displayName: string;
    };
    Separator: {
        (): JSX.Element;
        displayName: string;
    };
    DefaultItems: typeof DefaultItems;
};
export default MainMenu;
