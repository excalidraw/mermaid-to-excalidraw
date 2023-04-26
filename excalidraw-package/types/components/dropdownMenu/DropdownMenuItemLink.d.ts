import React from "react";
declare const DropdownMenuItemLink: {
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
export default DropdownMenuItemLink;
