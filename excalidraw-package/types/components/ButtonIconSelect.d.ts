export declare const ButtonIconSelect: <T extends Object>(props: {
    options: {
        value: T;
        text: string;
        icon: JSX.Element;
        testId?: string | undefined;
        /** if not supplied, defaults to value identity check */
        active?: boolean | undefined;
    }[];
    value: T | null;
    type?: "button" | "radio" | undefined;
} & ({
    type?: "radio" | undefined;
    group: string;
    onChange: (value: T) => void;
} | {
    type: "button";
    onClick: (value: T, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
})) => JSX.Element;
