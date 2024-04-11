import React from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types.js";
import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElementSkeleton[];
  files?: BinaryFiles;
}

const ExcalidrawWrapper = (props: ExcalidrawWrapperProps) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    React.useState<ExcalidrawImperativeAPI | null>(null);

  React.useEffect(() => {
    if (!props.elements || !excalidrawAPI) {
      return;
    }

    excalidrawAPI.updateScene({
      elements: convertToExcalidrawElements(props.elements),
    });
    excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
      fitToContent: true,
    });
  }, [props.elements]);

  React.useEffect(() => {
    if (!props.files || !excalidrawAPI) {
      return;
    }

    excalidrawAPI.addFiles(Object.values(props.files));
  }, [props.files]);

  return (
    <div className="excalidraw-wrapper">
      <Excalidraw
        initialData={{
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
        }}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
