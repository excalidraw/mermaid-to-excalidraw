/// <reference types="react" />
import Library from "../data/library";
import { LibraryItems, LibraryItem, AppState, ExcalidrawProps } from "../types";
import "./LibraryMenu.scss";
import { NonDeletedExcalidrawElement } from "../element/types";
export declare const LibraryMenuContent: ({ onInsertLibraryItems, pendingElements, onAddToLibrary, setAppState, libraryReturnUrl, library, id, appState, selectedItems, onSelectItems, }: {
    pendingElements: LibraryItem["elements"];
    onInsertLibraryItems: (libraryItems: LibraryItems) => void;
    onAddToLibrary: () => void;
    setAppState: React.Component<any, AppState>["setState"];
    libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
    library: Library;
    id: string;
    appState: AppState;
    selectedItems: LibraryItem["id"][];
    onSelectItems: (id: LibraryItem["id"][]) => void;
}) => JSX.Element;
export declare const LibraryMenu: React.FC<{
    appState: AppState;
    onInsertElements: (elements: readonly NonDeletedExcalidrawElement[]) => void;
    libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
    focusContainer: () => void;
    library: Library;
    id: string;
}>;
