import type { LevelDefinition, LevelSummary } from "../schema/level";
import { assertValidLevel } from "../validation/validateLevel";
import type { LevelRepository } from "./LevelRepository";

export class StaticLevelRepository implements LevelRepository {
  private readonly levels: ReadonlyMap<string, LevelDefinition>;

  constructor(levels: readonly LevelDefinition[]) {
    this.levels = new Map(levels.map((level) => [level.id, assertValidLevel(level)]));
  }

  async getLevel(id: string): Promise<LevelDefinition> {
    const level = this.levels.get(id);
    if (!level) throw new Error(`Static level not found: ${id}`);
    return structuredClone(level);
  }

  async listLevels(): Promise<LevelSummary[]> {
    return [...this.levels.values()].map((level) => ({
      id: level.id,
      name: level.metadata.name,
      chapter: level.metadata.chapter,
      difficulty: level.metadata.difficulty,
      thumbnailAsset: level.scene.thumbnailAsset
    }));
  }
}
