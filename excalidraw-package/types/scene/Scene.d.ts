import { ExcalidrawElement, NonDeletedExcalidrawElement, NonDeleted } from "../element/types";
import { LinearElementEditor } from "../element/linearElementEditor";
declare type ElementIdKey = InstanceType<typeof LinearElementEditor>["elementId"];
declare type ElementKey = ExcalidrawElement | ElementIdKey;
declare type SceneStateCallback = () => void;
declare type SceneStateCallbackRemover = () => void;
declare class Scene {
    private static sceneMapByElement;
    private static sceneMapById;
    static mapElementToScene(elementKey: ElementKey, scene: Scene): void;
    static getScene(elementKey: ElementKey): Scene | null;
    private callbacks;
    private nonDeletedElements;
    private elements;
    private elementsMap;
    getElementsIncludingDeleted(): readonly ExcalidrawElement[];
    getNonDeletedElements(): readonly NonDeletedExcalidrawElement[];
    getElement<T extends ExcalidrawElement>(id: T["id"]): T | null;
    getNonDeletedElement(id: ExcalidrawElement["id"]): NonDeleted<ExcalidrawElement> | null;
    /**
     * A utility method to help with updating all scene elements, with the added
     * performance optimization of not renewing the array if no change is made.
     *
     * Maps all current excalidraw elements, invoking the callback for each
     * element. The callback should either return a new mapped element, or the
     * original element if no changes are made. If no changes are made to any
     * element, this results in a no-op. Otherwise, the newly mapped elements
     * are set as the next scene's elements.
     *
     * @returns whether a change was made
     */
    mapElements(iteratee: (element: ExcalidrawElement) => ExcalidrawElement): boolean;
    replaceAllElements(nextElements: readonly ExcalidrawElement[]): void;
    informMutation(): void;
    addCallback(cb: SceneStateCallback): SceneStateCallbackRemover;
    destroy(): void;
    insertElementAtIndex(element: ExcalidrawElement, index: number): void;
    getElementIndex(elementId: string): number;
}
export default Scene;
