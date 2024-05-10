import {
  getTransformAttr,
  entityCodesToText,
  computeEdgePositions,
} from "../src/utils.js";

describe("Test Utils", () => {
  describe("Test entityCodesToText", () => {
    it("should convert entity codes to text", () => {
      expect(entityCodesToText("#9829;")).toBe("♥");
      expect(entityCodesToText("#6672;")).toBe("ᨐ");
    });
  });

  describe("Test getTransformAttr", () => {
    let el: HTMLDivElement;

    beforeEach(() => {
      el = document.createElement("div");
    });

    it("should return the correct transformX and transformY when transform attrubute is present", () => {
      el.setAttribute("transform", "translate(100, 200)");
      const { transformX, transformY } = getTransformAttr(el);
      expect(transformX).toBe(100);
      expect(transformY).toBe(200);
    });

    it("should return 0 for transformX and transformY if no transform attribute is set", () => {
      const { transformX, transformY } = getTransformAttr(el);
      expect(transformX).toBe(0);
      expect(transformY).toBe(0);
    });
  });

  describe("Test computeEdgePositions", () => {
    let pathElement: SVGPathElement;

    beforeEach(() => {
      pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
    });

    it("should throw an error if the element is not a path", () => {
      const divElement = document.createElement("div");
      //@ts-expect-error
      expect(() => computeEdgePositions(divElement)).toThrowError(
        'Invalid input: Expected an HTMLElement of tag "path", got DIV'
      );
    });

    it("should throw an error if the path element does not contain a 'd' attribute", () => {
      expect(() => computeEdgePositions(pathElement)).toThrowError(
        'Path element does not contain a "d" attribute'
      );
    });

    it("should return the correct startX, startY, endX, endY, and reflectionPoints", () => {
      pathElement.setAttribute("d", "M29.383,38.5L29.383,63.5L29.383,83.2");
      const { startX, startY, endX, endY, reflectionPoints } =
        computeEdgePositions(pathElement);
      expect(startX).toBe(29.383);
      expect(startY).toBe(38.5);
      expect(endX).toBe(29.383);
      expect(endY).toBe(83.2);
      expect(reflectionPoints).toEqual([
        { x: 29.383, y: 38.5 },
        { x: 29.383, y: 83.2 },
      ]);
    });

    it("should include the second last point if the distance to the last point is greater than 50 and second last point is straight line", () => {
      const commands = ["M29.383,38.5", "L29.383,83.2", "L90.383,83.2"];
      pathElement.setAttribute("d", commands.join(""));

      const result = computeEdgePositions(pathElement);

      expect(result.reflectionPoints).toEqual([
        { x: 29.383, y: 38.5 },
        { x: 29.383, y: 83.2 },
        { x: 90.383, y: 83.2 },
      ]);
    });

    it("should exclude the  second last point if the distance to the last point is less than 50 and second last point is straight line", () => {
      const commands = ["M29.383,38.5", "L29.383,83.2", "L59.383,83.2"];
      pathElement.setAttribute("d", commands.join(""));

      const result = computeEdgePositions(pathElement);

      expect(result.reflectionPoints).toEqual([
        { x: 29.383, y: 38.5 },
        { x: 59.383, y: 83.2 },
      ]);
    });

    it("should filter out points that are the same as the previous point", () => {
      const commands = ["M29.383,38.5", "L29.383,38.5", "L29.383,83.2"];
      pathElement.setAttribute("d", commands.join(""));

      const result = computeEdgePositions(pathElement);

      expect(result.reflectionPoints).toEqual([
        { x: 29.383, y: 38.5 },
        { x: 29.383, y: 83.2 },
      ]);
    });
  });
});
