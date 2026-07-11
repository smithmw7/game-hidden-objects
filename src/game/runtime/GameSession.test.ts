import { describe, expect, it } from "vitest";
import { quietMorningLevel } from "../../content/static/level-001/level";
import { GameSession } from "./GameSession";

describe("GameSession", () => {
  it("does not mutate the immutable level definition", () => {
    const before = structuredClone(quietMorningLevel);
    const session = new GameSession(quietMorningLevel);
    session.start(100);
    session.findObject(quietMorningLevel.objects[0].id, 200);
    expect(quietMorningLevel).toEqual(before);
  });

  it("completes once every target is found and calculates a result", () => {
    const session = new GameSession(quietMorningLevel);
    session.start(100);
    let result = null;
    quietMorningLevel.objects.forEach((object, index) => {
      result = session.findObject(object.id, 200 + index * 100);
    });
    expect(result).toMatchObject({ levelId: "level-001", stars: 3, incorrectTaps: 0, hintsUsed: 0 });
    expect(session.snapshot(2000).status).toBe("completed");
  });
});
