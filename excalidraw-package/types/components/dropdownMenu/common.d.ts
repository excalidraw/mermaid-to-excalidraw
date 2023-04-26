import React from "react";
export declare const DropdownMenuContentPropsContext: React.Context<{
    onSelect?: ((event: Event) => void) | undefined;
}>;
export declare const getDropdownMenuItemClassName: (className?: string) => string;
export declare const useHandleDropdownMenuItemClick: (origOnClick: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> | undefined, onSelect: ((event: Event) => void) | undefined) => (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => void;
