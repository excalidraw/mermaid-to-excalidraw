import { AppState, LibraryItems } from "../types";
import "./PublishLibrary.scss";
declare const PublishLibrary: ({ onClose, libraryItems, appState, onSuccess, onError, updateItemsInStorage, onRemove, }: {
    onClose: () => void;
    libraryItems: LibraryItems;
    appState: AppState;
    onSuccess: (data: {
        url: string;
        authorName: string;
        items: LibraryItems;
    }) => void;
    onError: (error: Error) => void;
    updateItemsInStorage: (items: LibraryItems) => void;
    onRemove: (id: string) => void;
}) => JSX.Element;
export default PublishLibrary;
