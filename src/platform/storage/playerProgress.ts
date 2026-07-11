import type { LevelResult } from "../../game/runtime/GameSession";
import { LocalProgressStore } from "./LocalProgressStore";
import type { PlayerProgress } from "./ProgressStore";
import { staticLevelRepository } from "../../content/static";

const store = new LocalProgressStore();

export async function loadPlayerProgress(): Promise<PlayerProgress> {
  const progress = await store.load();
  const changed = await applyUnlockRules(progress);
  if (changed) await store.save(progress);
  return progress;
}

export async function completeOnboarding(): Promise<PlayerProgress> {
  const progress = await loadPlayerProgress();
  progress.onboardingCompleted = true;
  await store.save(progress);
  return progress;
}

export async function updatePlayerSettings(settings: Partial<PlayerProgress["settings"]>): Promise<PlayerProgress> {
  const progress = await loadPlayerProgress();
  progress.settings = { ...progress.settings, ...settings };
  await store.save(progress);
  return progress;
}

export async function recordStaticLevelResult(result: LevelResult): Promise<PlayerProgress> {
  const progress = await loadPlayerProgress();
  const previous = progress.levels[result.levelId];
  progress.levels[result.levelId] = {
    completed: true,
    attempts: (previous?.attempts ?? 0) + 1,
    bestScore: Math.max(previous?.bestScore ?? 0, result.score),
    bestTimeMs: previous?.bestTimeMs == null ? result.elapsedMs : Math.min(previous.bestTimeMs, result.elapsedMs),
    bestStars: Math.max(previous?.bestStars ?? 0, result.stars) as 0 | 1 | 2 | 3
  };
  await applyUnlockRules(progress);
  await store.save(progress);
  return progress;
}

async function applyUnlockRules(progress: PlayerProgress): Promise<boolean> {
  const levels = await staticLevelRepository.listLevels();
  const unlocked = new Set(progress.unlockedLevelIds);
  if (levels[0]) unlocked.add(levels[0].id);
  levels.forEach((level, index) => {
    if (progress.levels[level.id]?.completed && levels[index + 1]) unlocked.add(levels[index + 1].id);
  });
  const next = levels.map((level) => level.id).filter((id) => unlocked.has(id));
  if (next.join("|") === progress.unlockedLevelIds.join("|")) return false;
  progress.unlockedLevelIds = next;
  return true;
}
