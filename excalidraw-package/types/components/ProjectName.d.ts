import "./TextInput.scss";
import "./ProjectName.scss";
declare type Props = {
    value: string;
    onChange: (value: string) => void;
    label: string;
    isNameEditable: boolean;
};
export declare const ProjectName: (props: Props) => JSX.Element;
export {};
