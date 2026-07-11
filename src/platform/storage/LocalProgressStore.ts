import { DEFAULT_PROGRESS, type PlayerProgress, type ProgressStore } from "./ProgressStore";

const STORAGE_KEY = "hidden-objects-player-progress-v1";

export class LocalProgressStore implements ProgressStore {
  async load(): Promise<PlayerProgress> {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return structuredClone(DEFAULT_PROGRESS);
    try {
      const parsed = JSON.parse(value) as PlayerProgress;
      return parsed.schemaVersion === 1 ? parsed : structuredClone(DEFAULT_PROGRESS);
    } catch {
      return structuredClone(DEFAULT_PROGRESS);
    }
  }

  async save(progress: PlayerProgress): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}
