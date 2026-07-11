import type * as Phaser from "phaser";
import { duration, gsap, motionDuration, motionEase } from "../../motion/gsap";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 2.5;

export interface ScrollPosition { x: number; y: number; }

export function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function clampScroll(position: ScrollPosition, viewport: { width: number; height: number }, zoom: number): ScrollPosition {
  return {
    x: Math.min(viewport.width - viewport.width / zoom, Math.max(0, position.x)),
    y: Math.min(viewport.height - viewport.height / zoom, Math.max(0, position.y))
  };
}

export class CameraController {
  private animation?: gsap.core.Tween;

  constructor(private readonly camera: Phaser.Cameras.Scene2D.Camera, private readonly viewport: { width: number; height: number }) {}

  get zoom(): number { return this.camera.zoom; }

  zoomBy(delta: number): number {
    return this.animateTo(this.camera.zoom + delta);
  }

  reset(): number {
    return this.animateTo(MIN_ZOOM);
  }

  setZoomImmediate(value: number, focus?: ScrollPosition): number {
    this.animation?.kill();
    const nextZoom = clampZoom(value);
    const center = focus ?? {
      x: this.camera.scrollX + this.viewport.width / (2 * this.camera.zoom),
      y: this.camera.scrollY + this.viewport.height / (2 * this.camera.zoom)
    };
    const scroll = clampScroll({
      x: center.x - this.viewport.width / (2 * nextZoom),
      y: center.y - this.viewport.height / (2 * nextZoom)
    }, this.viewport, nextZoom);
    this.camera.setZoom(nextZoom);
    this.camera.setScroll(scroll.x, scroll.y);
    return nextZoom;
  }

  panBy(screenDeltaX: number, screenDeltaY: number): void {
    if (this.camera.zoom <= MIN_ZOOM) return;
    this.animation?.kill();
    const scroll = clampScroll({
      x: this.camera.scrollX - screenDeltaX / this.camera.zoom,
      y: this.camera.scrollY - screenDeltaY / this.camera.zoom
    }, this.viewport, this.camera.zoom);
    this.camera.setScroll(scroll.x, scroll.y);
  }

  destroy(): void {
    this.animation?.kill();
  }

  private animateTo(value: number): number {
    const nextZoom = clampZoom(value);
    const center = {
      x: this.camera.scrollX + this.viewport.width / (2 * this.camera.zoom),
      y: this.camera.scrollY + this.viewport.height / (2 * this.camera.zoom)
    };
    const scroll = clampScroll({
      x: center.x - this.viewport.width / (2 * nextZoom),
      y: center.y - this.viewport.height / (2 * nextZoom)
    }, this.viewport, nextZoom);
    this.animation?.kill();
    this.animation = gsap.to(this.camera, {
      zoom: nextZoom,
      scrollX: scroll.x,
      scrollY: scroll.y,
      duration: duration(motionDuration.standard),
      ease: motionEase.settle
    });
    return nextZoom;
  }
}
