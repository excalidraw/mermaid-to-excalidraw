import { AppState, ExcalidrawProps, LibraryItem, LibraryItems } from "../types";
import "./LibraryMenuItems.scss";
declare const LibraryMenuItems: ({ isLoading, libraryItems, onAddToLibrary, onInsertLibraryItems, pendingElements, selectedItems, onSelectItems, theme, id, libraryReturnUrl, }: {
    isLoading: boolean;
    libraryItems: LibraryItems;
    pendingElements: LibraryItem["elements"];
    onInsertLibraryItems: (libraryItems: LibraryItems) => void;
    onAddToLibrary: (elements: LibraryItem["elements"]) => void;
    selectedItems: LibraryItem["id"][];
    onSelectItems: (id: LibraryItem["id"][]) => void;
    libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
    theme: AppState["theme"];
    id: string;
}) => JSX.Element;
export default LibraryMenuItems;
