import { StaticLevelRepository } from "../repositories/StaticLevelRepository";
import { quietMorningLevel } from "./level-001/level";
import { goldenHourLevel } from "./level-002/level";

export const staticLevelRepository = new StaticLevelRepository([quietMorningLevel, goldenHourLevel]);
