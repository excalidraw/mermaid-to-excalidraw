import type { ExcalidrawTextElement } from "@excalidraw/excalidraw/element/types";
import type { ValidLinearElement } from "@excalidraw/excalidraw/element/transform";

export type Arrow = Omit<Line, "type" | "strokeStyle"> & {
  type: "arrow";
  label?: {
    text: string | null;
    fontSize?: number;
    textAlign?: ExcalidrawTextElement["textAlign"];
    verticalAlign?: ExcalidrawTextElement["verticalAlign"];
    /** Where along the arrow (0 to 1) the label is centered. */
    labelPosition?: number;
  };
  strokeStyle?: ValidLinearElement["strokeStyle"] | null;
  strokeWidth?: ValidLinearElement["strokeWidth"];
  points?: readonly [number, number][];
  sequenceNumber?: Container;
  startArrowhead?: SupportedArrowhead;
  endArrowhead?: SupportedArrowhead;
  start?: ValidLinearElement["start"];
  end?: ValidLinearElement["end"];
  /** `null` for sharp corners. Round by default. */
  roundness?: ValidLinearElement["roundness"];
};

export type Line = {
  type: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id?: string;
  strokeColor?: string | null;
  strokeWidth?: number | null;
  strokeStyle?: ValidLinearElement["strokeStyle"] | null;
  groupId?: string;
  metadata?: { [key: string]: any };
};

export type Text = {
  type: "text";
  text: string;
  x: number;
  y: number;
  id?: string;
  width?: number;
  height?: number;
  fontSize: number;
  color?: string;
  textAlign?: ExcalidrawTextElement["textAlign"];
  groupId?: string;
  metadata?: { [key: string]: any };
};

export type Container = {
  type: "rectangle" | "ellipse";
  x: number;
  y: number;
  id?: string;
  label?: {
    text: string | null;
    fontSize: number;
    color?: string;
    textAlign?: ExcalidrawTextElement["textAlign"];
    verticalAlign?: ExcalidrawTextElement["verticalAlign"];
  };
  width?: number;
  height?: number;
  strokeStyle?: "dashed" | "solid";
  strokeWidth?: number;
  strokeColor?: string;
  bgColor?: string;
  subtype?: "actor" | "activation" | "highlight" | "note" | "sequence";
  groupId?: string;
  metadata?: { [key: string]: any };
};

export type Node = Container | Line | Arrow | Text;

export type CardinalityArrowhead =
  | "cardinality_one"
  | "cardinality_many"
  | "cardinality_one_or_many"
  | "cardinality_exactly_one"
  | "cardinality_zero_or_one"
  | "cardinality_zero_or_many";

export type SupportedArrowhead =
  | ValidLinearElement["startArrowhead"]
  | CardinalityArrowhead;
