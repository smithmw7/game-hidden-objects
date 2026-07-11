import { describe, expect, it } from "vitest";
import { clampScroll, clampZoom } from "./CameraController";

describe("CameraController math", () => {
  it("clamps zoom to the supported interaction range", () => {
    expect(clampZoom(0.2)).toBe(1);
    expect(clampZoom(1.8)).toBe(1.8);
    expect(clampZoom(4)).toBe(2.5);
  });

  it("clamps scroll to the visible world at the current zoom", () => {
    expect(clampScroll({ x: -20, y: 900 }, { width: 390, height: 700 }, 2)).toEqual({ x: 0, y: 350 });
    expect(clampScroll({ x: 80, y: 120 }, { width: 390, height: 700 }, 2)).toEqual({ x: 80, y: 120 });
  });
});
