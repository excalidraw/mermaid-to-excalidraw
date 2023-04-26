import { AppState, ExcalidrawProps } from "../types";
declare const LibraryMenuBrowseButton: ({ theme, id, libraryReturnUrl, }: {
    libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
    theme: AppState["theme"];
    id: string;
}) => JSX.Element;
export default LibraryMenuBrowseButton;
