import { GraphConverter } from "../GraphConverter.js";
import {
    transformToExcalidrawContainerSkeleton,
    transformToExcalidrawArrowSkeleton,
    transformToExcalidrawTextSkeleton,
} from "../transformToExcalidrawSkeleton.js";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";
import type { ER } from "../../parser/er.js";

export const ERToExcalidrawSkeletonConverter = new GraphConverter({
    converter: (chart: ER, _options) => {
        const elements: ExcalidrawElementSkeleton[] = [];

        chart.entities.forEach((entity) => {
            const excalidrawElement = transformToExcalidrawContainerSkeleton(entity);
            elements.push(excalidrawElement);
        });

        chart.relationships.forEach((relationship) => {
            const excalidrawElement = transformToExcalidrawArrowSkeleton(relationship);
            elements.push(excalidrawElement);
        });

        chart.text.forEach((textElement) => {
            const excalidrawElement = transformToExcalidrawTextSkeleton(textElement);
            elements.push(excalidrawElement);
        });

        return { elements };
    },
});
