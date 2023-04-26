import "./IconPicker.scss";
export declare function IconPicker<T>({ value, label, options, onChange, group, }: {
    label: string;
    value: T;
    options: {
        value: T;
        text: string;
        icon: JSX.Element;
        keyBinding: string;
    }[];
    onChange: (value: T) => void;
    group?: string;
}): JSX.Element;
