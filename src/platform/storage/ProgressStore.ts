export interface LevelProgress {
  completed: boolean;
  attempts: number;
  bestScore: number;
  bestTimeMs: number | null;
  bestStars: 0 | 1 | 2 | 3;
}

export interface PlayerProgress {
  schemaVersion: 1;
  onboardingCompleted: boolean;
  unlockedLevelIds: string[];
  levels: Record<string, LevelProgress>;
  settings: {
    musicEnabled: boolean;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    reducedMotion: boolean;
  };
}

export interface ProgressStore {
  load(): Promise<PlayerProgress>;
  save(progress: PlayerProgress): Promise<void>;
}

export const DEFAULT_PROGRESS: PlayerProgress = {
  schemaVersion: 1,
  onboardingCompleted: false,
  unlockedLevelIds: ["level-001"],
  levels: {},
  settings: { musicEnabled: true, soundEnabled: true, hapticsEnabled: true, reducedMotion: false }
};
