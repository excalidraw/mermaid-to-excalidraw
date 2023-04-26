/// <reference types="react" />
import "./LiveCollaborationTrigger.scss";
declare const LiveCollaborationTrigger: {
    ({ isCollaborating, onSelect, ...rest }: {
        isCollaborating: boolean;
        onSelect: () => void;
    } & import("react").ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element;
    displayName: string;
};
export default LiveCollaborationTrigger;
