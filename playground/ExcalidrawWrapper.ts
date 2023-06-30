import React, { useEffect, useMemo } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import {
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "../src/types";

interface ExcalidrawWrapperProps {
  elements: ExcalidrawElement[];
  files?: BinaryFiles;
}
const resolvablePromise = () => {
  let resolve;
  let reject;
  const promise: any = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
};
const ExcalidrawWrapper = (props: ExcalidrawWrapperProps) => {
  const excalidrawRef = useMemo(
    () => ({
      current: {
        readyPromise: resolvablePromise(),
      },
    }),
    []
  );

  useEffect(() => {
    excalidrawRef.current.readyPromise.then(
      (excalidrawAPI: ExcalidrawImperativeAPI) => {
        setTimeout(() => {
          excalidrawAPI.updateScene({
            elements: props.elements,
          });
          excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements(), {
            fitToContent: true,
          });
        }, 0);
      }
    );
  }, [excalidrawRef.current]);

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
          files: props.files,
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
