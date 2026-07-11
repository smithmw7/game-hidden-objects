import * as Phaser from "phaser";
import type { HiddenObject } from "../../types/models";

export interface HiddenObjectSceneData {
  imageUrl: string;
  objects: HiddenObject[];
  onComplete?: (elapsedMs: number) => void;
}

export class HiddenObjectScene extends Phaser.Scene {
  private payload!: HiddenObjectSceneData;
  private startTime = 0;
  private hudText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private foundCount = 0;

  constructor() {
    super("HiddenObjectScene");
  }

  init(data: HiddenObjectSceneData): void {
    this.payload = data;
    this.foundCount = 0;
  }

  preload(): void {
    this.load.image("level-image", this.payload.imageUrl);
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const bg = this.add.image(width / 2, height / 2, "level-image");
    bg.setDisplaySize(width, height);

    this.hudText = this.add.text(12, 12, this.formatChecklist(), {
      fontFamily: "Arial",
      color: "#f5f2e8",
      fontSize: "16px",
      backgroundColor: "#3a2e26"
    });
    this.hudText.setPadding(8, 8, 8, 8);

    this.timerText = this.add.text(width - 130, 12, "00:00", {
      fontFamily: "Arial",
      color: "#f5f2e8",
      fontSize: "16px",
      backgroundColor: "#3a2e26"
    });
    this.timerText.setPadding(8, 8, 8, 8);

    this.startTime = performance.now();

    this.payload.objects.forEach((obj) => {
      const zone = this.add.rectangle(
        obj.x * width,
        obj.y * height,
        obj.width * width,
        obj.height * height,
        0xf3b969,
        0.1
      );
      zone.setStrokeStyle(2, 0xf3b969, 0.35);
      zone.setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => this.onFoundObject(obj, zone));
    });
  }

  update(): void {
    if (!this.timerText) {
      return;
    }

    const elapsedMs = performance.now() - this.startTime;
    const sec = Math.floor(elapsedMs / 1000);
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    this.timerText.setText(`${mm}:${ss}`);
  }

  private onFoundObject(target: HiddenObject, zone: Phaser.GameObjects.Rectangle): void {
    if (target.found) {
      return;
    }
    target.found = true;
    this.foundCount += 1;
    zone.setFillStyle(0x74e3a2, 0.3);
    zone.disableInteractive();
    this.hudText?.setText(this.formatChecklist());

    if (this.foundCount === this.payload.objects.length) {
      const elapsedMs = performance.now() - this.startTime;
      this.payload.onComplete?.(elapsedMs);
      this.add.text(20, this.cameras.main.height - 42, "Completed!", {
        color: "#f5f2e8",
        backgroundColor: "#2f6f52",
        fontSize: "20px"
      });
    }
  }

  private formatChecklist(): string {
    const labels = this.payload.objects
      .map((obj) => `${obj.found ? "✓" : "○"} ${obj.label}`)
      .join("  ");
    return `Find: ${labels}`;
  }
}
