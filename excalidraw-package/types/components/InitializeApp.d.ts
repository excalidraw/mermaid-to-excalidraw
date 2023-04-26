import React from "react";
import { Language } from "../i18n";
import { Theme } from "../element/types";
interface Props {
    langCode: Language["code"];
    children: React.ReactElement;
    theme?: Theme;
}
export declare const InitializeApp: (props: Props) => JSX.Element;
export {};
