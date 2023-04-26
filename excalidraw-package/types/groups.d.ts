import { GroupId, ExcalidrawElement, NonDeleted } from "./element/types";
import { AppState } from "./types";
export declare const selectGroup: (groupId: GroupId, appState: AppState, elements: readonly NonDeleted<ExcalidrawElement>[]) => AppState;
/**
 * If the element's group is selected, don't render an individual
 * selection border around it.
 */
export declare const isSelectedViaGroup: (appState: AppState, element: ExcalidrawElement) => boolean;
export declare const getSelectedGroupForElement: (appState: AppState, element: ExcalidrawElement) => string | undefined;
export declare const getSelectedGroupIds: (appState: AppState) => GroupId[];
/**
 * When you select an element, you often want to actually select the whole group it's in, unless
 * you're currently editing that group.
 */
export declare const selectGroupsForSelectedElements: (appState: AppState, elements: readonly NonDeleted<ExcalidrawElement>[]) => AppState;
export declare const editGroupForSelectedElement: (appState: AppState, element: NonDeleted<ExcalidrawElement>) => AppState;
export declare const isElementInGroup: (element: ExcalidrawElement, groupId: string) => boolean;
export declare const getElementsInGroup: (elements: readonly ExcalidrawElement[], groupId: string) => ExcalidrawElement[];
export declare const getSelectedGroupIdForElement: (element: ExcalidrawElement, selectedGroupIds: {
    [groupId: string]: boolean;
}) => string | undefined;
export declare const getNewGroupIdsForDuplication: (groupIds: ExcalidrawElement["groupIds"], editingGroupId: AppState["editingGroupId"], mapper: (groupId: GroupId) => GroupId) => string[];
export declare const addToGroup: (prevGroupIds: ExcalidrawElement["groupIds"], newGroupId: GroupId, editingGroupId: AppState["editingGroupId"]) => string[];
export declare const removeFromSelectedGroups: (groupIds: ExcalidrawElement["groupIds"], selectedGroupIds: {
    [groupId: string]: boolean;
}) => string[];
export declare const getMaximumGroups: (elements: ExcalidrawElement[]) => ExcalidrawElement[][];
