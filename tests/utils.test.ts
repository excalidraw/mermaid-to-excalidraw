import { getTransformAttr } from "../src/utils.ts";

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
