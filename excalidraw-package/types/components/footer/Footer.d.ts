import { ActionManager } from "../../actions/manager";
import { AppState } from "../../types";
declare const Footer: {
    ({ appState, actionManager, showExitZenModeBtn, renderWelcomeScreen, }: {
        appState: AppState;
        actionManager: ActionManager;
        showExitZenModeBtn: boolean;
        renderWelcomeScreen: boolean;
    }): JSX.Element;
    displayName: string;
};
export default Footer;
