export const LEVEL_SCHEMA_VERSION = 1 as const;

export type LevelSource = "static" | "dynamic";
export type LevelDifficulty = "tutorial" | "easy" | "medium" | "hard";
export type LevelFitMode = "contain" | "cover";

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface NormalizedRect extends NormalizedPoint {
  width: number;
  height: number;
}

export interface HiddenObjectDefinition {
  id: string;
  label: string;
  hitRegion: NormalizedRect;
  focusPoint: NormalizedPoint;
  difficulty: 1 | 2 | 3;
  hintRadius: number;
  accessibilityLabel: string;
  /** Independent, text-free artwork. Null until the item-art export is available. */
  iconAsset: string | null;
}

export interface LevelDefinition {
  schemaVersion: typeof LEVEL_SCHEMA_VERSION;
  id: string;
  source: LevelSource;
  revision: number;
  metadata: {
    name: string;
    chapter: string;
    description: string;
    difficulty: LevelDifficulty;
    estimatedSeconds: number;
  };
  scene: {
    imageAsset: string;
    thumbnailAsset: string;
    nativeWidth: number;
    nativeHeight: number;
    fitMode: LevelFitMode;
    focalPoint: NormalizedPoint;
  };
  rules: {
    mode: "untimed" | "countdown";
    durationSeconds?: number;
    incorrectTapPenaltySeconds: number;
    availableHints: number;
    scoreThresholds: {
      oneStar: number;
      twoStars: number;
      threeStars: number;
    };
  };
  objects: HiddenObjectDefinition[];
}

export interface LevelSummary {
  id: string;
  name: string;
  chapter: string;
  difficulty: LevelDifficulty;
  thumbnailAsset: string;
}
