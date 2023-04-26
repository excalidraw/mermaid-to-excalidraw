import type * as TExcalidraw from "../index";
import "./App.scss";
import { ExcalidrawImperativeAPI } from "../../../types";
declare global {
    interface Window {
        ExcalidrawLib: typeof TExcalidraw;
    }
}
export interface AppProps {
    appTitle: string;
    useCustom: (api: ExcalidrawImperativeAPI | null, customArgs?: any[]) => void;
    customArgs?: any[];
}
export default function App({ appTitle, useCustom, customArgs }: AppProps): JSX.Element;
