import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

interface ExcalidrawWrapperProps {
  elements: any[];
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
