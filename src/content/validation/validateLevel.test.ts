import { describe, expect, it } from "vitest";
import { quietMorningLevel } from "../static/level-001/level";
import { validateLevel } from "./validateLevel";

describe("validateLevel", () => {
  it("accepts the bundled Level 1 definition", () => {
    expect(validateLevel(quietMorningLevel)).toEqual([]);
  });

  it("rejects duplicate object ids and out-of-bounds regions", () => {
    const level = structuredClone(quietMorningLevel);
    level.objects[1].id = level.objects[0].id;
    level.objects[1].hitRegion.x = 0.99;
    expect(validateLevel(level).map((issue) => issue.message)).toEqual(expect.arrayContaining([
      "Object ids must be unique.",
      "Hit region must fit inside normalized scene bounds."
    ]));
  });
});
