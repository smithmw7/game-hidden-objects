import { StaticLevelRepository } from "../repositories/StaticLevelRepository";
import { quietMorningLevel } from "./level-001/level";

export const staticLevelRepository = new StaticLevelRepository([quietMorningLevel]);
