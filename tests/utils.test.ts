import { entityCodesToText, dedupeConsecutivePoints } from "../src/utils.js";

describe("Test Utils", () => {
  describe("Test entityCodesToText", () => {
    it("should convert entity codes to text", () => {
      expect(entityCodesToText("#9829;")).toBe("♥");
      expect(entityCodesToText("#6672;")).toBe("ᨐ");
    });
  });

  describe("Test dedupeConsecutivePoints", () => {
    it("should filter out consecutive duplicate tuple points", () => {
      expect(
        dedupeConsecutivePoints([
          [0, 0],
          [0, 0],
          [10, 5],
          [10, 5],
          [20, 10],
        ])
      ).toEqual([
        [0, 0],
        [10, 5],
        [20, 10],
      ]);
    });

    it("should preserve non-consecutive repeated tuple points", () => {
      expect(
        dedupeConsecutivePoints([
          [0, 0],
          [10, 5],
          [0, 0],
        ])
      ).toEqual([
        [0, 0],
        [10, 5],
        [0, 0],
      ]);
    });

    it("should filter out very close consecutive points within the threshold", () => {
      expect(
        dedupeConsecutivePoints([
          [0, 0],
          [-11.143636363744733, 40.5],
          [-11.143636363744733, 80.5],
          [-11.143636363744733, 80.60000000149012],
          [-11.143636363744733, 131.10000000149012],
          [28.841774120706717, 181.60000000149012],
          [28.920953152548876, 181.60000000149012],
          [68.90636363700033, 131.10000000149012],
        ])
      ).toEqual([
        [0, 0],
        [-11.143636363744733, 40.5],
        [-11.143636363744733, 80.5],
        [-11.143636363744733, 131.10000000149012],
        [28.841774120706717, 181.60000000149012],
        [68.90636363700033, 131.10000000149012],
      ]);
    });

    it("should compare against the last kept point when applying the threshold", () => {
      expect(
        dedupeConsecutivePoints([
          [0, 0],
          [0.4, 0],
          [0.8, 0],
          [1.5, 0],
        ])
      ).toEqual([
        [0, 0],
        [0.8, 0],
        [1.5, 0],
      ]);
    });
  });
});
