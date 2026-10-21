export function extractDefinition(text) {
  const blocks = [
    ...text.matchAll(
      /^\s*(`{3,}|~{3,})mermaid[^\S\r\n]*\r?\n([\s\S]*?)^\s*\1[^\S\r\n]*$/gim
    ),
  ];
  if (blocks.length > 1) {
    throw new Error(
      "Input contains multiple Mermaid blocks. Put one diagram in each file."
    );
  }
  const definition = (blocks.length ? blocks[0][2] : text).trim();
  if (!definition) {
    throw new Error("The Mermaid input is empty.");
  }
  return definition;
}
