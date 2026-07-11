import type { LevelFitMode, NormalizedPoint, NormalizedRect } from "../../content/schema/level";

export interface Size {
  width: number;
  height: number;
}

export interface ViewportTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  renderedWidth: number;
  renderedHeight: number;
}

export function createViewportTransform(source: Size, viewport: Size, fitMode: LevelFitMode): ViewportTransform {
  if (source.width <= 0 || source.height <= 0 || viewport.width <= 0 || viewport.height <= 0) {
    throw new Error("Source and viewport dimensions must be positive.");
  }
  const scaleX = viewport.width / source.width;
  const scaleY = viewport.height / source.height;
  const scale = fitMode === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
  const renderedWidth = source.width * scale;
  const renderedHeight = source.height * scale;
  return {
    scale,
    renderedWidth,
    renderedHeight,
    offsetX: (viewport.width - renderedWidth) / 2,
    offsetY: (viewport.height - renderedHeight) / 2
  };
}

export function normalizedToScreen(point: NormalizedPoint, source: Size, transform: ViewportTransform): NormalizedPoint {
  return {
    x: transform.offsetX + point.x * source.width * transform.scale,
    y: transform.offsetY + point.y * source.height * transform.scale
  };
}

export function screenToNormalized(point: NormalizedPoint, source: Size, transform: ViewportTransform): NormalizedPoint {
  return {
    x: (point.x - transform.offsetX) / transform.scale / source.width,
    y: (point.y - transform.offsetY) / transform.scale / source.height
  };
}

export function normalizedRectToScreen(rect: NormalizedRect, source: Size, transform: ViewportTransform): NormalizedRect {
  const origin = normalizedToScreen(rect, source, transform);
  return {
    ...origin,
    width: rect.width * source.width * transform.scale,
    height: rect.height * source.height * transform.scale
  };
}

export function containsNormalizedPoint(rect: NormalizedRect, point: NormalizedPoint, tolerance = 0): boolean {
  return point.x >= rect.x - tolerance && point.x <= rect.x + rect.width + tolerance &&
    point.y >= rect.y - tolerance && point.y <= rect.y + rect.height + tolerance;
}
