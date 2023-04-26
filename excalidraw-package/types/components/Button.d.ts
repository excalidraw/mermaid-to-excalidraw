/// <reference types="react" />
import "./Button.scss";
interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    type?: "button" | "submit" | "reset";
    onSelect: () => any;
    children: React.ReactNode;
    className?: string;
}
/**
 * A generic button component that follows Excalidraw's design system.
 * Style can be customised using `className` or `style` prop.
 * Accepts all props that a regular `button` element accepts.
 */
export declare const Button: ({ type, onSelect, children, className, ...rest }: ButtonProps) => JSX.Element;
export {};
