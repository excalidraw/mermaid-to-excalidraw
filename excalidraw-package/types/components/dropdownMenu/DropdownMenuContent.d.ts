import React from "react";
declare const MenuContent: {
    ({ children, onClickOutside, className, onSelect, style, }: {
        children?: React.ReactNode;
        onClickOutside?: (() => void) | undefined;
        className?: string | undefined;
        /**
         * Called when any menu item is selected (clicked on).
         */
        onSelect?: ((event: Event) => void) | undefined;
        style?: React.CSSProperties | undefined;
    }): JSX.Element;
    displayName: string;
};
export default MenuContent;
