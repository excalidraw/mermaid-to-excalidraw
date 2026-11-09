# Contributing

```bash
yarn            # install packages
yarn start      # start the development playground
yarn build      # build the package into dist/
```

The [development guide](https://plus.excalidraw.com/docs/mermaid-to-excalidraw/development) and [how it works](https://plus.excalidraw.com/docs/mermaid-to-excalidraw/how-it-works) explain the conversion pipeline and where a change goes. To support a new diagram type, follow [adding a diagram type](https://plus.excalidraw.com/docs/mermaid-to-excalidraw/adding-a-diagram-type).

## Tests

- `yarn test` runs the unit tests.
- `yarn test:visual` runs the visual tests, and `yarn test:visual:update` updates their snapshots.
- `yarn test:visual:dev` starts the visual tests' dev server, usually more useful than the playground while you work on a case.

Test cases are Mermaid files in [`testcases/`](testcases/testcases.ts), named `<type>-<name>.mmd` (`flowchart`, `sequence`, `class`, `erd`, `state`, `unsupported`, `swimlane`, `gantt`, `quadrant`, `timeline`):

- `testcases/features/`: one syntax feature each. The playground lists them, the visual tests snapshot each one (named after the file), and the unit tests parse them. Add a case as a new file; renaming one renames its snapshot.
- `testcases/examples/`: whole diagrams models wrote for the prompts in [`prompts.md`](testcases/examples/prompts.md), with the model and prompt in `%%` comments at the top.

## README banner

The banner is rendered from [`.github/assets/banner/`](.github/assets/banner/render.mjs): its diagram is `flow.mmd` converted with this package. See the comments at the top of `render.mjs` to regenerate it.
