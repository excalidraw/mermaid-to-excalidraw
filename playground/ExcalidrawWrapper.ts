import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "../src/types";

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  files?: BinaryFiles;
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
