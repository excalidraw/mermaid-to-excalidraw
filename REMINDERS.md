# Reminders

## Class Diagram Arrow Routing

- Revisit class-diagram relation routing once prettier bezier arrows are available in Excalidraw.
- Current behavior intentionally splits class-edge handling into two paths in [src/parser/class.ts](/root/dev/mermaid-to-excalidraw/src/parser/class.ts):
  - Standard class-to-class relations are flattened to straight connections because Mermaid's routed middle points looked less readable in Excalidraw.
  - Self-referencing relations and note connectors keep their routed paths because they need the extra geometry.
- When bezier arrows are good enough, reevaluate whether standard class relations should preserve Mermaid routing or convert routed bends into smoother curved arrows instead.
- If that happens, the class-specific routing policy helpers are the place to remove or replace:
  - `createStraightClassRelationArrowFromEdgePath`
  - `createPreservedRouteArrowFromEdgePaths`
