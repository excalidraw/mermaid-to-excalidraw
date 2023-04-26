/// <reference types="react" />
import "./WelcomeScreen.scss";
declare const WelcomeScreen: {
    (props: {
        children?: React.ReactNode;
    }): JSX.Element;
    displayName: string;
    Center: {
        ({ children }: {
            children?: import("react").ReactNode;
        }): JSX.Element;
        displayName: string;
        Logo: {
            ({ children }: {
                children?: import("react").ReactNode;
            }): JSX.Element;
            displayName: string;
        };
        Heading: {
            ({ children }: {
                children: import("react").ReactNode;
            }): JSX.Element;
            displayName: string;
        };
        Menu: {
            ({ children }: {
                children?: import("react").ReactNode;
            }): JSX.Element;
            displayName: string;
        };
        MenuItem: {
            ({ onSelect, children, icon, shortcut, className, ...props }: {
                onSelect: () => void;
                children: import("react").ReactNode;
                icon?: JSX.Element | undefined;
                shortcut?: string | null | undefined;
            } & import("react").ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element;
            displayName: string;
        };
        MenuItemLink: {
            ({ children, href, icon, shortcut, className, ...props }: {
                children: import("react").ReactNode;
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
    Hints: {
        MenuHint: {
            ({ children }: {
                children?: import("react").ReactNode;
            }): JSX.Element;
            displayName: string;
        };
        ToolbarHint: {
            ({ children }: {
                children?: import("react").ReactNode;
            }): JSX.Element;
            displayName: string;
        };
        HelpHint: {
            ({ children }: {
                children?: import("react").ReactNode;
            }): JSX.Element;
            displayName: string;
        };
    };
};
export default WelcomeScreen;
