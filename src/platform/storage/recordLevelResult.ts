import type { LevelResult } from "../../game/runtime/GameSession";
import { recordStaticLevelResult } from "./playerProgress";

export async function recordLevelResult(result: LevelResult): Promise<void> {
  await recordStaticLevelResult(result);
}
