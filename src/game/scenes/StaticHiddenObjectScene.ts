import * as Phaser from "phaser";
import type { LevelDefinition } from "../../content/schema/level";
import { GameSession, type LevelResult } from "../runtime/GameSession";
import { createViewportTransform, normalizedRectToScreen } from "../runtime/viewportTransform";
import { animateFoundRing } from "../../motion/gameMotion";
import { gsap } from "../../motion/gsap";

export interface StaticHiddenObjectSceneData {
  level: LevelDefinition;
  onProgress?: (foundObjectIds: readonly string[], total: number) => void;
  onComplete?: (result: LevelResult) => void;
}

export class StaticHiddenObjectScene extends Phaser.Scene {
  private payload!: StaticHiddenObjectSceneData;
  private session!: GameSession;
  private foundCount = 0;

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
    const source = { width: level.scene.nativeWidth, height: level.scene.nativeHeight };
    const transform = createViewportTransform(source, { width, height }, level.scene.fitMode);

    const image = this.add.image(width / 2, height / 2, level.id);
    image.setDisplaySize(transform.renderedWidth, transform.renderedHeight);

    level.objects.forEach((object) => {
      const bounds = normalizedRectToScreen(object.hitRegion, source, transform);
      const zone = this.add.zone(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, bounds.width, bounds.height);
      zone.setInteractive({ useHandCursor: true });
      zone.setData("objectId", object.id);
      zone.on("pointerdown", () => {
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
  }

  private showFoundFeedback(x: number, y: number): void {
    const ring = this.add.circle(x, y, 18, 0x96a58d, 0.12).setStrokeStyle(2, 0xf7f5ef, 0.9);
    animateFoundRing(ring, () => ring.destroy());
  }

  shutdown(): void {
    gsap.killTweensOf(this.children.list);
  }
}
