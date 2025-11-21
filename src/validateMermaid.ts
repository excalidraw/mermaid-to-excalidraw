import mermaid from "mermaid";

export async function validateMermaid(mermaidStr: string) {
  return mermaid.parse(mermaidStr, { suppressErrors: true });
}
