import "./Toast.scss";
export declare const Toast: ({ message, onClose, closable, duration, }: {
    message: string;
    onClose: () => void;
    closable?: boolean | undefined;
    duration?: number | undefined;
}) => JSX.Element;
