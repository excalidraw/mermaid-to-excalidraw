const ExcalidrawWrapper = (props) => {
  const excalidrawRef = React.useRef(null);

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
