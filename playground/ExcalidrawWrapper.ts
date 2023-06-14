import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

// TODO: refactor type
interface ExcalidrawWrapperProps {
  elements: any[];
  files: any;
}
const ExcalidrawWrapper = (props: ExcalidrawWrapperProps) => {
  const excalidrawRef = React.useRef(null);

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
          elements: props.elements,
          files: props.files,
          appState: {
            viewBackgroundColor: "#fafafa",
            currentItemFontFamily: 1,
          },
          scrollToContent: true,
        },
        ref: excalidrawRef,
      })
    )
  );
};

export default ExcalidrawWrapper;
