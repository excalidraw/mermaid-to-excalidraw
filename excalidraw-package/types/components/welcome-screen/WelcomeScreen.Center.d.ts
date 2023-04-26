/// <reference types="react" />
declare const Center: {
    ({ children }: {
        children?: React.ReactNode;
    }): JSX.Element;
    displayName: string;
    Logo: {
        ({ children }: {
            children?: React.ReactNode;
        }): JSX.Element;
        displayName: string;
    };
    Heading: {
        ({ children }: {
            children: React.ReactNode;
        }): JSX.Element;
        displayName: string;
    };
    Menu: {
        ({ children }: {
            children?: React.ReactNode;
        }): JSX.Element;
        displayName: string;
    };
    MenuItem: {
        ({ onSelect, children, icon, shortcut, className, ...props }: {
            onSelect: () => void;
            children: React.ReactNode;
            icon?: JSX.Element | undefined;
            shortcut?: string | null | undefined;
        } & import("react").ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element;
        displayName: string;
    };
    MenuItemLink: {
        ({ children, href, icon, shortcut, className, ...props }: {
            children: React.ReactNode;
            href: string;
            icon?: JSX.Element | undefined;
            shortcut?: string | null | undefined;
        } & import("react").AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element;
        displayName: string;
    };
    MenuItemHelp: {
        (): JSX.Element;
        displayName: string;
    };
    MenuItemLoadScene: {
        (): JSX.Element | null;
        displayName: string;
    };
    MenuItemLiveCollaborationTrigger: {
        ({ onSelect, }: {
            onSelect: () => any;
        }): JSX.Element;
        displayName: string;
    };
};
export { Center };
