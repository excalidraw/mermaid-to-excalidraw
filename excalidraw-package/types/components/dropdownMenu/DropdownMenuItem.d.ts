import React from "react";
declare const DropdownMenuItem: {
    ({ icon, onSelect, children, shortcut, className, ...rest }: {
        icon?: JSX.Element | undefined;
        onSelect: (event: Event) => void;
        children: React.ReactNode;
        shortcut?: string | undefined;
        className?: string | undefined;
    } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">): JSX.Element;
    displayName: string;
};
export default DropdownMenuItem;
