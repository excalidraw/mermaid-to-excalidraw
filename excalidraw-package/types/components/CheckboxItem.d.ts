import React from "react";
import "./CheckboxItem.scss";
export declare const CheckboxItem: React.FC<{
    checked: boolean;
    onChange: (checked: boolean, event: React.MouseEvent) => void;
    className?: string;
    children?: React.ReactNode;
}>;
