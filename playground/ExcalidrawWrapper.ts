import {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "../src/types";

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  files?: BinaryFiles;
}
const ExcalidrawWrapper = (props: ExcalidrawWrapperProps) => {
  const excalidrawRef = React.useRef(null);

  React.useEffect(() => {
    if (!props.elements || !excalidrawRef.current) {
      return;
    }

    const excalidrawAPI = excalidrawRef.current as ExcalidrawImperativeAPI;
    excalidrawAPI.updateScene({
      elements: props.elements,
    });
    excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
      fitToContent: true,
    });
  }, [props.elements]);

  React.useEffect(() => {
    if (!props.files || !excalidrawRef.current) {
      return;
    }

    const excalidrawAPI = excalidrawRef.current as ExcalidrawImperativeAPI;
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
      React.createElement(ExcalidrawLib.Excalidraw, {
        initialData: {
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
        },
        ref: excalidrawRef,
      })
    )
  );
};

export default ExcalidrawWrapper;
