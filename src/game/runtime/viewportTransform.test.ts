import { describe, expect, it } from "vitest";
import { createViewportTransform, normalizedToScreen, screenToNormalized } from "./viewportTransform";

describe("viewportTransform", () => {
  it("preserves aspect ratio with cover fitting", () => {
    const transform = createViewportTransform({ width: 1536, height: 2048 }, { width: 390, height: 700 }, "cover");
    expect(transform.renderedHeight).toBeCloseTo(700);
    expect(transform.renderedWidth).toBeGreaterThan(390);
  });

  it("round trips normalized coordinates", () => {
    const source = { width: 1536, height: 2048 };
    const transform = createViewportTransform(source, { width: 390, height: 700 }, "cover");
    const point = { x: 0.443, y: 0.182 };
    expect(screenToNormalized(normalizedToScreen(point, source, transform), source, transform)).toEqual({
      x: expect.closeTo(point.x, 8),
      y: expect.closeTo(point.y, 8)
    });
  });
});
