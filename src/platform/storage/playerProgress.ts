import type { LevelResult } from "../../game/runtime/GameSession";
import { LocalProgressStore } from "./LocalProgressStore";
import type { PlayerProgress } from "./ProgressStore";

const store = new LocalProgressStore();

export function loadPlayerProgress(): Promise<PlayerProgress> {
  return store.load();
}

export async function completeOnboarding(): Promise<PlayerProgress> {
  const progress = await store.load();
  progress.onboardingCompleted = true;
  await store.save(progress);
  return progress;
}

export async function updatePlayerSettings(settings: Partial<PlayerProgress["settings"]>): Promise<PlayerProgress> {
  const progress = await store.load();
  progress.settings = { ...progress.settings, ...settings };
  await store.save(progress);
  return progress;
}

export async function recordStaticLevelResult(result: LevelResult): Promise<PlayerProgress> {
  const progress = await store.load();
  const previous = progress.levels[result.levelId];
  progress.levels[result.levelId] = {
    completed: true,
    attempts: (previous?.attempts ?? 0) + 1,
    bestScore: Math.max(previous?.bestScore ?? 0, result.score),
    bestTimeMs: previous?.bestTimeMs == null ? result.elapsedMs : Math.min(previous.bestTimeMs, result.elapsedMs),
    bestStars: Math.max(previous?.bestStars ?? 0, result.stars) as 0 | 1 | 2 | 3
  };
  await store.save(progress);
  return progress;
}
