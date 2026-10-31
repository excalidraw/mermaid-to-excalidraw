## Unreleased

### Improvements

- Draw class diagram namespaces like flowchart subgraphs, as boxes around their classes with their titles where Pele draws them, instead of as frames.

## v3.1.0

### Improvements

- Load Pele's code for each diagram type on first use (`pele/lazy`) instead of for all of them up front: e.g. converting a first flowchart downloads ~66 KiB (brotli) instead of ~217 KiB. Bundlers emit the per-diagram code as separate chunks.

## v3.0.0

### Breaking changes

- Diagrams are parsed and laid out by [Pele](https://pele.run) instead of Mermaid, which is no longer a dependency. Layouts differ from v2's.
- Removed the `engine` and `startOnLoad` config params.

### Features

- Convert `swimlane-beta` diagrams (lanes with their headers, edges as elbow arrows).
- Keep labels where Pele placed them along their arrows (flowchart edges, state transitions, class and ER relations), with `label.labelPosition`. Excalidraw versions without it for skeleton arrows ([excalidraw/excalidraw#12425](https://github.com/excalidraw/excalidraw/pull/12425)) center them.

## Unreleased

### v2.1.0

- Upgrade mermaid to 11.12.1
- Add ERD support

### Features

- Support ClassDef for styling the nodes by [@ad1992](https://github.com/ad1992) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/71

## v1.1.0 (2024-07-10)

## Library

### Features

- Add support for passing config params `maxEdge`, `maxTextSize` and more params to mermaid by [@ad1992](https://github.com/ad1992) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/68.

You can read about it [here](https://github.com/excalidraw/mermaid-to-excalidraw/blob/f2c4908acd1a4837e71169fd9b339a7eee1c63bc/README.md#get-started).

Additonally the param `fontSize` is renamed to `themeVariables.fontSize` and type is changed from `number` to `string` to be consistent with the [mermaid config](https://mermaid.js.org/schemas/config.schema.json).

## v1.0.0 (2024-05-20)

## Library

### Features

- Add support for an open link by [@igorwessel](https://github.com/igorwessel). in https://github.com/excalidraw/mermaid-to-excalidraw/pull/51

### Fixes

- Render class diagrams correctly by using data-id by [@ad1992](https://github.com/ad1992) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/53
- Normalize text when transforming to excalidraw skeleton by [@ad1992](https://github.com/ad1992) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/54
- Only consider edges which are present in DOM for flowchart by [@ad1992](https://github.com/ad1992) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/64
- Flowchart rendering issues by [@igorwessel](https://github.com/igorwessel). in https://github.com/excalidraw/mermaid-to-excalidraw/pull/61

### Docs

- Fix example code in README by [@jtaavola](https://github.com/jtaavola) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/35

### Build

- Add cross-env for platform independent build by [@zsviczian](https://github.com/zsviczian) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/33

### Test

- Add vitest and some tests by [@ad1992](https://github.com/ad1992) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/63

## Playground

### Build

- Simple setup vite for playground by [@igorwessel](https://github.com/igorwessel). in https://github.com/excalidraw/mermaid-to-excalidraw/pull/52
- Add GH link by [@ad1992](https://github.com/ad1992) in https://github.com/excalidraw/mermaid-to-excalidraw/pull/57

## New Contributors

- [@igorwessel](https://github.com/igorwessel). made their first contribution in https://github.com/excalidraw/mermaid-to-excalidraw/pull/51
- [@jtaavola](https://github.com/jtaavola) made their first contribution in https://github.com/excalidraw/mermaid-to-excalidraw/pull/35
- [@zsviczian](https://github.com/zsviczian) made their first contribution in https://github.com/excalidraw/mermaid-to-excalidraw/pull/33

**Full Changelog**: https://github.com/excalidraw/mermaid-to-excalidraw/compare/v0.3.0...v0.4.0

## 0.3.0 (2023-12-10)

## Library

### Features

- Support sequence elements creation and destruction and upgrade mermaid to 10.9.0 [#46](https://github.com/excalidraw/mermaid-to-excalidraw/pull/46) by [@ad1992](https://github.com/ad1992).

### Fixes

- Fix double rendering of class diagrams when name space present and also fix grouping [#46](https://github.com/excalidraw/mermaid-to-excalidraw/pull/46) by [@ad1992](https://github.com/ad1992).

## 0.2.0 (2023-12-06)

## Library

### Features

- Support Mermaid Class Diagrams 🥳 [#42](https://github.com/excalidraw/mermaid-to-excalidraw/pull/42) by [@ad1992](https://github.com/ad1992).

- Support Mermaid Sequence Diagrams 🥳 [#34](https://github.com/excalidraw/mermaid-to-excalidraw/pull/34) by [@ad1992](https://github.com/ad1992).

### Fixes

- Update arrow types for class diagrams [#44](https://github.com/excalidraw/mermaid-to-excalidraw/pull/44) by [@ad1992](https://github.com/ad1992).

## Playground

**_This section lists the updates made to the playground and will not affect the integration._**

### Fixes

- Clear parcel cache before starting dev server [#39](https://github.com/excalidraw/mermaid-to-excalidraw/pull/39) by [@ad1992](https://github.com/ad1992).

- Trigger mermaid.render only once for each diagram in playground [#41](https://github.com/excalidraw/mermaid-to-excalidraw/pull/41) by [@ad1992](https://github.com/ad1992).

### Chore

- Adding Complex Decisions & Subprocesses Charts in playground [#31](https://github.com/excalidraw/mermaid-to-excalidraw/pull/31) by [@DYNAMICMORTAL](https://github.com/DYNAMICMORTAL)

---

## 0.1.2 (2023-11-03)

## Library

### Features

- Support Sequence Diagrams [#34](https://github.com/excalidraw/mermaid-to-excalidraw/pull/34) by [@ad1992](https://github.com/ad1992).

## Playground

**_This section lists the updates made to the playground and will not affect the integration._**

### Chore

- Adding an example of Complex Decisions & Subprocesses Charts in playground [#31](https://github.com/excalidraw/mermaid-to-excalidraw/pull/31) by [@DYNAMICMORTAL](https://github.com/DYNAMICMORTAL).

## 0.1.1 (2023-09-21)

### Fixes

- Support module resolution nodenext so type module works in host [#30](https://github.com/excalidraw/mermaid-to-excalidraw/pull/30) by [@ad1992](https://github.com/ad1992).

### Build

- Don't minify build output [#29](https://github.com/excalidraw/mermaid-to-excalidraw/pull/29) by [@ad1992](https://github.com/ad1992).

### Chore

- use excalidraw v0.16.0 [#28](https://github.com/excalidraw/mermaid-to-excalidraw/pull/28) by [@ad1992](https://github.com/ad1992).

## 0.1.0 (2023-09-13)

First release of the package [@excalidraw/mermaid-to-excalidraw](https://www.npmjs.com/package/@excalidraw/mermaid-to-excalidraw?activeTab=versions) 🎉
