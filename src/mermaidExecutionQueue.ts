// Module-scoped tail promise shared by this bundle's Mermaid callers.
let mermaidTaskQueue: Promise<void> = Promise.resolve();

/**
 * Serializes Mermaid work behind a single promise tail.
 *
 * This exists because Mermaid is effectively a singleton in-process:
 * `mermaid.initialize()` mutates shared config, `getDiagramFromText()` and
 * `render()` use shared internal state, and `render()` also inserts temporary
 * DOM nodes while it works. If those operations overlap, callers can race on
 * config, parser state, and transient DOM.
 *
 * The returned promise preserves the caller's real result or error. The
 * internal queue tail is normalized back to `Promise<void>` so a failed task
 * does not poison the queue or leave the queue state holding an unhandled
 * rejection.
 */
export const runMermaidTaskSequentially = <T>(task: () => Promise<T>) => {
  const run = mermaidTaskQueue.then(task, task);

  mermaidTaskQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
};
