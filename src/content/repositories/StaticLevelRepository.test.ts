import { describe, expect, it } from "vitest";
import { staticLevelRepository } from "../static";

describe("staticLevelRepository", () => {
  it("lists both handcrafted levels in progression order", async () => {
    const levels = await staticLevelRepository.listLevels();
    expect(levels.map((level) => level.id)).toEqual(["level-001", "level-002"]);
  });

  it("returns isolated level data so a session cannot mutate repository content", async () => {
    const first = await staticLevelRepository.getLevel("level-002");
    first.objects[0].label = "Changed";
    const second = await staticLevelRepository.getLevel("level-002");
    expect(second.objects[0].label).toBe("Sailboat");
  });
});
