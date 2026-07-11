import type { LevelDefinition } from "../../content/schema/level";

export type GameSessionStatus = "ready" | "playing" | "paused" | "completed" | "abandoned";

export interface LevelResult {
  levelId: string;
  elapsedMs: number;
  score: number;
  stars: 1 | 2 | 3;
  incorrectTaps: number;
  hintsUsed: number;
}

export interface GameSessionSnapshot {
  sessionId: string;
  levelId: string;
  status: GameSessionStatus;
  startedAt: number | null;
  elapsedMs: number;
  foundObjectIds: readonly string[];
  incorrectTaps: number;
  hintsUsed: number;
  availableHints: number;
}

export class GameSession {
  private status: GameSessionStatus = "ready";
  private startedAt: number | null = null;
  private accumulatedMs = 0;
  private readonly foundObjectIds = new Set<string>();
  private incorrectTaps = 0;
  private hintsUsed = 0;

  readonly sessionId = crypto.randomUUID();

  constructor(private readonly level: Readonly<LevelDefinition>) {}

  start(now = performance.now()): void {
    if (this.status !== "ready") return;
    this.status = "playing";
    this.startedAt = now;
  }

  pause(now = performance.now()): void {
    if (this.status !== "playing" || this.startedAt === null) return;
    this.accumulatedMs += now - this.startedAt;
    this.startedAt = null;
    this.status = "paused";
  }

  resume(now = performance.now()): void {
    if (this.status !== "paused") return;
    this.startedAt = now;
    this.status = "playing";
  }

  findObject(objectId: string, now = performance.now()): LevelResult | null {
    if (this.status !== "playing") return null;
    if (!this.level.objects.some((object) => object.id === objectId)) return null;
    this.foundObjectIds.add(objectId);
    return this.foundObjectIds.size === this.level.objects.length ? this.complete(now) : null;
  }

  recordIncorrectTap(): void {
    if (this.status === "playing") this.incorrectTaps += 1;
  }

  useHint(): boolean {
    if (this.status !== "playing" || this.hintsUsed >= this.level.rules.availableHints) return false;
    this.hintsUsed += 1;
    return true;
  }

  getElapsedMs(now = performance.now()): number {
    return this.accumulatedMs + (this.status === "playing" && this.startedAt !== null ? now - this.startedAt : 0);
  }

  snapshot(now = performance.now()): GameSessionSnapshot {
    return {
      sessionId: this.sessionId,
      levelId: this.level.id,
      status: this.status,
      startedAt: this.startedAt,
      elapsedMs: this.getElapsedMs(now),
      foundObjectIds: [...this.foundObjectIds],
      incorrectTaps: this.incorrectTaps,
      hintsUsed: this.hintsUsed,
      availableHints: this.level.rules.availableHints - this.hintsUsed
    };
  }

  private complete(now: number): LevelResult {
    this.pause(now);
    this.status = "completed";
    const elapsedMs = this.accumulatedMs;
    const timeBonus = Math.max(0, 500 - Math.floor(elapsedMs / 1000));
    const score = Math.max(1, 1000 + timeBonus - this.incorrectTaps * 10 - this.hintsUsed * 100);
    const thresholds = this.level.rules.scoreThresholds;
    const stars: 1 | 2 | 3 = score >= thresholds.threeStars ? 3 : score >= thresholds.twoStars ? 2 : 1;
    return { levelId: this.level.id, elapsedMs, score, stars, incorrectTaps: this.incorrectTaps, hintsUsed: this.hintsUsed };
  }
}
