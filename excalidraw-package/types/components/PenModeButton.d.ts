import "./ToolIcon.scss";
declare type PenModeIconProps = {
    title?: string;
    name?: string;
    checked: boolean;
    onChange?(): void;
    zenModeEnabled?: boolean;
    isMobile?: boolean;
    penDetected: boolean;
};
export declare const PenModeButton: (props: PenModeIconProps) => JSX.Element | null;
export {};
