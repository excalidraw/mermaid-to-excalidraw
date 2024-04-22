import {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types.js";
import { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/types/data/transform.js";

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElementSkeleton[];
  files?: BinaryFiles;
}

const { Excalidraw, convertToExcalidrawElements } = ExcalidrawLib;
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

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      {
        className: "excalidraw-wrapper",
      },
      React.createElement(Excalidraw, {
        initialData: {
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
        },
        excalidrawAPI: (api) => setExcalidrawAPI(api),
      })
    )
  );
};

export default ExcalidrawWrapper;
