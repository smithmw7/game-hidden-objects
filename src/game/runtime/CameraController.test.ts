import { describe, expect, it } from "vitest";
import { clampViewportDelta, clampZoom } from "./CameraController";

describe("CameraController math", () => {
  it("clamps zoom to the supported interaction range", () => {
    expect(clampZoom(0.2)).toBe(1);
    expect(clampZoom(1.8)).toBe(1.8);
    expect(clampZoom(4)).toBe(2.5);
  });

  it("clamps panning so no artwork edge is exposed", () => {
    const bounds = { x: 0, y: 90, width: 390, height: 520 };
    expect(clampViewportDelta({ x: -20, y: 400, width: 195, height: 350 }, bounds)).toEqual({ x: 20, y: -140 });
    expect(clampViewportDelta({ x: 80, y: 120, width: 195, height: 350 }, bounds)).toEqual({ x: 0, y: 0 });
  });

  it("centers an artwork axis smaller than the visible viewport", () => {
    const bounds = { x: 0, y: 90, width: 390, height: 520 };
    expect(clampViewportDelta({ x: 20, y: 0, width: 390, height: 700 }, bounds)).toEqual({ x: -20, y: 0 });
  });
});
