import * as Phaser from "phaser";
import type { LevelDefinition } from "../../content/schema/level";
import { GameSession, type LevelResult } from "../runtime/GameSession";
import { createViewportTransform, normalizedRectToScreen } from "../runtime/viewportTransform";
import { animateFoundRing, animateHintRing, animateIncorrectTap } from "../../motion/gameMotion";
import { gsap } from "../../motion/gsap";

export interface StaticHiddenObjectSceneData {
  level: LevelDefinition;
  onProgress?: (foundObjectIds: readonly string[], total: number) => void;
  onElapsed?: (elapsedMs: number) => void;
  onHintsChanged?: (available: number) => void;
  onIncorrectTap?: (count: number) => void;
  onComplete?: (result: LevelResult) => void;
}

export class StaticHiddenObjectScene extends Phaser.Scene {
  private payload!: StaticHiddenObjectSceneData;
  private session!: GameSession;
  private foundCount = 0;
  private lastTimerSecond = -1;
  private source = { width: 1, height: 1 };
  private transform = createViewportTransform(this.source, this.source, "contain");

  constructor() {
    super("StaticHiddenObjectScene");
  }

  init(data: StaticHiddenObjectSceneData): void {
    this.payload = data;
    this.session = new GameSession(data.level);
    this.foundCount = 0;
  }

  preload(): void {
    this.load.image(this.payload.level.id, this.payload.level.scene.imageAsset);
  }

  create(): void {
    const { width, height } = this.scale;
    const level = this.payload.level;
    this.source = { width: level.scene.nativeWidth, height: level.scene.nativeHeight };
    this.transform = createViewportTransform(this.source, { width, height }, level.scene.fitMode);

    const image = this.add.image(width / 2, height / 2, level.id);
    image.setDisplaySize(this.transform.renderedWidth, this.transform.renderedHeight);
    image.setInteractive();
    image.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!(pointer.event?.target instanceof HTMLCanvasElement)) return;
      this.session.recordIncorrectTap();
      const count = this.session.snapshot().incorrectTaps;
      this.payload.onIncorrectTap?.(count);
      const marker = this.add.circle(pointer.worldX, pointer.worldY, 9, 0xf4f1e9, 0).setStrokeStyle(1.5, 0xf4f1e9, 0.7);
      animateIncorrectTap(marker, () => marker.destroy());
    });

    level.objects.forEach((object) => {
      const bounds = normalizedRectToScreen(object.hitRegion, this.source, this.transform);
      const zone = this.add.zone(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width, bounds.height);
      zone.setInteractive({ useHandCursor: true });
      zone.setData("objectId", object.id);
      zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (!(pointer.event?.target instanceof HTMLCanvasElement)) return;
        const result = this.session.findObject(object.id);
        if (zone.input?.enabled === false) return;
        zone.disableInteractive();
        this.foundCount += 1;
        this.payload.onProgress?.(this.session.snapshot().foundObjectIds, level.objects.length);
        this.showFoundFeedback(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        if (result) this.payload.onComplete?.(result);
      });
    });

    this.session.start();
    this.payload.onProgress?.([], level.objects.length);
    this.payload.onHintsChanged?.(level.rules.availableHints);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => gsap.killTweensOf(this.children.list));
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

  requestHint(): boolean {
    const found = new Set(this.session.snapshot().foundObjectIds);
    const target = this.payload.level.objects.find((object) => !found.has(object.id));
    if (!target || !this.session.useHint()) return false;
    const point = normalizedRectToScreen({ ...target.focusPoint, width: 0, height: 0 }, this.source, this.transform);
    const ring = this.add.circle(point.x, point.y, 20, 0x96a58d, 0).setStrokeStyle(3, 0xf7f5ef, 1);
    animateHintRing(ring, () => ring.destroy());
    this.payload.onHintsChanged?.(this.session.snapshot().availableHints);
    return true;
  }

  private showFoundFeedback(x: number, y: number): void {
    const ring = this.add.circle(x, y, 18, 0x96a58d, 0.12).setStrokeStyle(2, 0xf7f5ef, 0.9);
    animateFoundRing(ring, () => ring.destroy());
  }

}
