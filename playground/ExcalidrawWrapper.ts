import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

const ExcalidrawWrapper = (props: any) => {
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
        },
        ref: excalidrawRef,
      })
    )
  );
};

export default ExcalidrawWrapper;