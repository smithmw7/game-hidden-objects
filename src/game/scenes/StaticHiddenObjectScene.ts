import * as Phaser from "phaser";
import type { LevelDefinition } from "../../content/schema/level";
import { GameSession, type LevelResult } from "../runtime/GameSession";
import { createViewportTransform, normalizedRectToScreen } from "../runtime/viewportTransform";
import { animateFoundRing, animateHintRing, animateIncorrectTap } from "../../motion/gameMotion";
import { gsap } from "../../motion/gsap";
import { CameraController, MIN_ZOOM } from "../runtime/CameraController";

export interface StaticHiddenObjectSceneData {
  level: LevelDefinition;
  onProgress?: (foundObjectIds: readonly string[], total: number) => void;
  onElapsed?: (elapsedMs: number) => void;
  onHintsChanged?: (available: number) => void;
  onIncorrectTap?: (count: number) => void;
  onZoomChanged?: (zoom: number) => void;
  onComplete?: (result: LevelResult) => void;
  onLoadError?: (message: string) => void;
}

export class StaticHiddenObjectScene extends Phaser.Scene {
  private payload!: StaticHiddenObjectSceneData;
  private session!: GameSession;
  private foundCount = 0;
  private lastTimerSecond = -1;
  private source = { width: 1, height: 1 };
  private transform = createViewportTransform(this.source, this.source, "contain");
  private readonly motion = new Set<gsap.core.Animation>();
  private cameraController?: CameraController;
  private readonly gestures = new Map<number, { x: number; y: number; distance: number }>();
  private lastPinchDistance = 0;
  private lastPinchMidpoint?: { x: number; y: number };
  private debugHitAreas?: Phaser.GameObjects.Graphics;

  constructor() {
    super("StaticHiddenObjectScene");
  }

  init(data: StaticHiddenObjectSceneData): void {
    this.payload = data;
    this.session = new GameSession(data.level);
    this.foundCount = 0;
  }

  preload(): void {
    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
      this.payload.onLoadError?.("The scene artwork could not be loaded. Please try again.");
    });
    this.load.image(this.payload.level.id, this.payload.level.scene.imageAsset);
  }

  create(): void {
    const { width, height } = this.scale;
    const level = this.payload.level;
    this.source = { width: level.scene.nativeWidth, height: level.scene.nativeHeight };
    this.transform = createViewportTransform(this.source, { width, height }, level.scene.fitMode);
    this.cameraController = new CameraController(this.cameras.main, { width, height }, {
      x: this.transform.offsetX,
      y: this.transform.offsetY,
      width: this.transform.renderedWidth,
      height: this.transform.renderedHeight
    });
    this.input.addPointer(1);
    this.configureGestures();

    const image = this.add.image(width / 2, height / 2, level.id);
    image.setDisplaySize(this.transform.renderedWidth, this.transform.renderedHeight);
    image.setInteractive();
    image.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!(pointer.event?.target instanceof HTMLCanvasElement)) return;
      if (!this.isTap(pointer)) return;
      this.session.recordIncorrectTap();
      const count = this.session.snapshot().incorrectTaps;
      this.payload.onIncorrectTap?.(count);
      const marker = this.add.circle(pointer.worldX, pointer.worldY, 9, 0xf4f1e9, 0).setStrokeStyle(1.5, 0xf4f1e9, 0.7);
      this.motion.add(animateIncorrectTap(marker, () => marker.destroy()));
    });

    level.objects.forEach((object) => {
      const bounds = normalizedRectToScreen(object.hitRegion, this.source, this.transform);
      const zone = this.add.zone(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width, bounds.height);
      zone.setInteractive({ useHandCursor: true });
      zone.setData("objectId", object.id);
      zone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
        if (!(pointer.event?.target instanceof HTMLCanvasElement)) return;
        if (!this.isTap(pointer)) return;
        const result = this.session.findObject(object.id);
        if (zone.input?.enabled === false) return;
        zone.disableInteractive();
        this.foundCount += 1;
        this.payload.onProgress?.(this.session.snapshot().foundObjectIds, level.objects.length);
        this.showFoundFeedback(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        if (result) this.payload.onComplete?.(result);
      });
    });

    this.debugHitAreas = this.add.graphics().setDepth(100).setVisible(false);
    this.debugHitAreas.fillStyle(0xa9c8e8, 0.28).lineStyle(2, 0xe6f2ff, 0.95);
    level.objects.forEach((object) => {
      const bounds = normalizedRectToScreen(object.hitRegion, this.source, this.transform);
      this.debugHitAreas?.fillRect(bounds.x, bounds.y, bounds.width, bounds.height).strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    });

    this.session.start();
    this.payload.onProgress?.([], level.objects.length);
    this.payload.onHintsChanged?.(level.rules.availableHints);
    const stopMotion = () => {
      this.motion.forEach((animation) => animation.kill());
      this.motion.clear();
      this.cameraController?.destroy();
      gsap.killTweensOf(this.children.list);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, stopMotion);
    this.events.once(Phaser.Scenes.Events.DESTROY, stopMotion);
  }

  update(): void {
    const elapsedMs = this.session.getElapsedMs();
    const second = Math.floor(elapsedMs / 1000);
    if (second !== this.lastTimerSecond) {
      this.lastTimerSecond = second;
      this.payload.onElapsed?.(elapsedMs);
    }
  }

  pauseSession(): void {
    this.session.pause();
    this.scene.pause();
  }

  resumeSession(): void {
    this.session.resume();
    this.scene.resume();
  }

  getCameraState(): { zoom: number; scrollX: number; scrollY: number; maxZoom: number; visibleWorld?: { x: number; y: number; width: number; height: number }; focalProbe?: { x: number; y: number } } {
    const state = this.cameraController?.state ?? { zoom: MIN_ZOOM, scrollX: 0, scrollY: 0 };
    return {
      ...state,
      maxZoom: 2.5,
      visibleWorld: this.cameraController?.visibleWorld,
      focalProbe: this.cameraController?.worldAtScreen({ x: 120, y: 300 })
    };
  }

  setHitAreasVisible(visible: boolean): void {
    this.debugHitAreas?.setVisible(visible);
  }

  requestHint(): boolean {
    const found = new Set(this.session.snapshot().foundObjectIds);
    const target = this.payload.level.objects.find((object) => !found.has(object.id));
    if (!target || !this.session.useHint()) return false;
    const point = normalizedRectToScreen({ ...target.focusPoint, width: 0, height: 0 }, this.source, this.transform);
    const ring = this.add.circle(point.x, point.y, 20, 0x96a58d, 0).setStrokeStyle(3, 0xf7f5ef, 1);
    this.motion.add(animateHintRing(ring, () => ring.destroy()));
    this.cameraController?.centerOnWorldPoint(Math.max(this.cameras.main.zoom, 1.35), { x: point.x, y: point.y });
    this.payload.onZoomChanged?.(this.cameras.main.zoom);
    this.payload.onHintsChanged?.(this.session.snapshot().availableHints);
    return true;
  }

  private configureGestures(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!(pointer.event?.target instanceof HTMLCanvasElement)) return;
      this.gestures.set(pointer.id, { x: pointer.x, y: pointer.y, distance: 0 });
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const gesture = this.gestures.get(pointer.id);
      if (!gesture || !pointer.isDown) return;
      const dx = pointer.x - gesture.x;
      const dy = pointer.y - gesture.y;
      gesture.x = pointer.x;
      gesture.y = pointer.y;
      gesture.distance += Math.hypot(dx, dy);

      const pointer1 = this.input.pointer1;
      const pointer2 = this.input.pointer2;
      if (pointer1.isDown && pointer2.isDown) {
        const pinchDistance = Phaser.Math.Distance.Between(pointer1.x, pointer1.y, pointer2.x, pointer2.y);
        const midpoint = { x: (pointer1.x + pointer2.x) / 2, y: (pointer1.y + pointer2.y) / 2 };
        if (this.lastPinchDistance > 0) {
          if (this.lastPinchMidpoint) {
            this.cameraController?.panBy(midpoint.x - this.lastPinchMidpoint.x, midpoint.y - this.lastPinchMidpoint.y, false);
          }
          const zoom = this.cameraController?.zoomAtScreenPoint(this.cameras.main.zoom * (pinchDistance / this.lastPinchDistance), midpoint);
          if (zoom !== undefined) this.payload.onZoomChanged?.(zoom);
        }
        this.lastPinchDistance = pinchDistance;
        this.lastPinchMidpoint = midpoint;
        return;
      }
      this.lastPinchDistance = 0;
      this.lastPinchMidpoint = undefined;
      this.cameraController?.panBy(dx, dy);
    });
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      this.time.delayedCall(0, () => this.gestures.delete(pointer.id));
      if (!this.input.pointer1.isDown || !this.input.pointer2.isDown) {
        this.lastPinchDistance = 0;
        this.lastPinchMidpoint = undefined;
        this.cameraController?.finishGesture();
      }
    });
    this.payload.onZoomChanged?.(MIN_ZOOM);
  }

  private isTap(pointer: Phaser.Input.Pointer): boolean {
    return (this.gestures.get(pointer.id)?.distance ?? 0) < 8;
  }

  private showFoundFeedback(x: number, y: number): void {
    const ring = this.add.circle(x, y, 18, 0x96a58d, 0.12).setStrokeStyle(2, 0xf7f5ef, 0.9);
    this.motion.add(animateFoundRing(ring, () => ring.destroy()));
  }

}
