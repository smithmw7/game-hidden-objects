import type * as Phaser from "phaser";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 2.5;

export interface Point { x: number; y: number; }
export interface ContentBounds extends Point { width: number; height: number; }
export interface VisibleRect extends Point { width: number; height: number; }

export function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

/** Returns the world-space correction needed to keep the visible rectangle
 * inside the artwork. An axis smaller than the viewport remains centered. */
export function clampViewportDelta(visible: VisibleRect, bounds: ContentBounds, centerSmaller = true): Point {
  return {
    x: axisCorrection(visible.x, visible.width, bounds.x, bounds.width, centerSmaller),
    y: axisCorrection(visible.y, visible.height, bounds.y, bounds.height, centerSmaller)
  };
}

function axisCorrection(visibleStart: number, visibleSize: number, contentStart: number, contentSize: number, centerSmaller: boolean): number {
  if (contentSize <= visibleSize) {
    return centerSmaller ? contentStart + contentSize / 2 - (visibleStart + visibleSize / 2) : 0;
  }
  if (visibleStart < contentStart) return contentStart - visibleStart;
  const visibleEnd = visibleStart + visibleSize;
  const contentEnd = contentStart + contentSize;
  return visibleEnd > contentEnd ? contentEnd - visibleEnd : 0;
}

export class CameraController {
  constructor(
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    private readonly viewport: { width: number; height: number },
    private readonly bounds: ContentBounds
  ) {}

  get zoom(): number { return this.camera.zoom; }
  get state(): { zoom: number; scrollX: number; scrollY: number } {
    return { zoom: this.camera.zoom, scrollX: this.camera.scrollX, scrollY: this.camera.scrollY };
  }
  worldAtScreen(point: Point): Point {
    const world = this.camera.getWorldPoint(point.x, point.y);
    return { x: world.x, y: world.y };
  }
  get visibleWorld(): VisibleRect {
    const topLeft = this.worldAtScreen({ x: 0, y: 0 });
    const bottomRight = this.worldAtScreen({ x: this.viewport.width, y: this.viewport.height });
    return { x: topLeft.x, y: topLeft.y, width: bottomRight.x - topLeft.x, height: bottomRight.y - topLeft.y };
  }

  /** Uses Phaser's camera transform as the source of truth, preserving the
   * exact world point beneath the two-finger gesture centroid. */
  zoomAtScreenPoint(value: number, screenPoint: Point): number {
    const before = this.camera.getWorldPoint(screenPoint.x, screenPoint.y);
    const nextZoom = clampZoom(value);
    this.camera.setZoom(nextZoom);
    this.camera.preRender();
    const after = this.camera.getWorldPoint(screenPoint.x, screenPoint.y);
    this.camera.scrollX += before.x - after.x;
    this.camera.scrollY += before.y - after.y;
    this.camera.preRender();
    return nextZoom;
  }

  centerOnWorldPoint(value: number, worldPoint: Point): number {
    const nextZoom = clampZoom(value);
    this.camera.setZoom(nextZoom);
    this.camera.centerOn(worldPoint.x, worldPoint.y);
    this.camera.preRender();
    this.clampToArtwork();
    return nextZoom;
  }

  panBy(screenDeltaX: number, screenDeltaY: number, clamp = true): void {
    this.camera.scrollX -= screenDeltaX / this.camera.zoom;
    this.camera.scrollY -= screenDeltaY / this.camera.zoom;
    this.camera.preRender();
    if (clamp) this.clampToArtwork();
  }

  finishGesture(): void { this.clampToArtwork(); }

  destroy(): void { /* Camera owns no external resources. */ }

  private clampToArtwork(centerSmaller = true): void {
    const topLeft = this.camera.getWorldPoint(0, 0);
    const bottomRight = this.camera.getWorldPoint(this.viewport.width, this.viewport.height);
    const correction = clampViewportDelta({
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    }, this.bounds, centerSmaller);
    this.camera.scrollX += correction.x;
    this.camera.scrollY += correction.y;
    this.camera.preRender();
  }
}
