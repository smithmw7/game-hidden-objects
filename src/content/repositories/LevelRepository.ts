import type { LevelDefinition, LevelSummary } from "../schema/level";

export interface LevelRepository {
  getLevel(id: string): Promise<LevelDefinition>;
  listLevels(): Promise<LevelSummary[]>;
}
