import React from "react";
export declare type SidebarProps<P = {}> = {
    children: React.ReactNode;
    /**
     * Called on sidebar close (either by user action or by the editor).
     */
    onClose?: () => void | boolean;
    /** if not supplied, sidebar won't be dockable */
    onDock?: (docked: boolean) => void;
    docked?: boolean;
    initialDockedState?: boolean;
    dockable?: boolean;
    className?: string;
} & P;
export declare type SidebarPropsContextValue = Pick<SidebarProps, "onClose" | "onDock" | "docked" | "dockable">;
export declare const SidebarPropsContext: React.Context<SidebarPropsContextValue>;
