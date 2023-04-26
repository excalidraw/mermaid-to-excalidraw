import { ReactNode } from "react";
import "./DialogActionButton.scss";
interface DialogActionButtonProps {
    label: string;
    children?: ReactNode;
    actionType?: "primary" | "danger";
    isLoading?: boolean;
}
declare const DialogActionButton: ({ label, onClick, className, children, actionType, type, isLoading, ...rest }: DialogActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => JSX.Element;
export default DialogActionButton;
