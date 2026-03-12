import { GraphConverter } from "../GraphConverter.js";
import type { FileId } from "@excalidraw/excalidraw/element/types";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/element/transform";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import { nanoid } from "nanoid";
import { GraphImage } from "../../interfaces.js";

export const GraphImageConverter = new GraphConverter<GraphImage>({
  converter: (graph) => {
    const imageId = nanoid() as FileId;

    const { width, height } = graph;
    const imageElement: ExcalidrawElementSkeleton = {
      type: "image",
      x: 0,
      y: 0,
      width,
      height,
      status: "saved",
      fileId: imageId,
    };
    const files = {
      [imageId]: {
        id: imageId,
        mimeType: graph.mimeType,
        dataURL: graph.dataURL,
      },
    } as BinaryFiles;
    return { files, elements: [imageElement] };
  },
});
