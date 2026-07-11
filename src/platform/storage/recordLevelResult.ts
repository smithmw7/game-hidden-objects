import type { LevelResult } from "../../game/runtime/GameSession";
import { LocalProgressStore } from "./LocalProgressStore";

const progressStore = new LocalProgressStore();

export async function recordLevelResult(result: LevelResult): Promise<void> {
  const progress = await progressStore.load();
  const previous = progress.levels[result.levelId];
  progress.levels[result.levelId] = {
    completed: true,
    attempts: (previous?.attempts ?? 0) + 1,
    bestScore: Math.max(previous?.bestScore ?? 0, result.score),
    bestTimeMs: previous?.bestTimeMs == null ? result.elapsedMs : Math.min(previous.bestTimeMs, result.elapsedMs),
    bestStars: Math.max(previous?.bestStars ?? 0, result.stars) as 0 | 1 | 2 | 3
  };
  await progressStore.save(progress);
}
