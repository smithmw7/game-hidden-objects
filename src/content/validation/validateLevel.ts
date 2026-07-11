import { LEVEL_SCHEMA_VERSION, type LevelDefinition, type NormalizedPoint, type NormalizedRect } from "../schema/level";

export interface ValidationIssue {
  path: string;
  message: string;
}

const HUD_SAFE_BOTTOM = 0.09;
const TRAY_SAFE_TOP = 0.92;

function validPoint(point: NormalizedPoint): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y) &&
    point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

function validRect(rect: NormalizedRect): boolean {
  return validPoint(rect) && rect.width > 0 && rect.height > 0 &&
    rect.x + rect.width <= 1 && rect.y + rect.height <= 1;
}

export function validateLevel(level: LevelDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (level.schemaVersion !== LEVEL_SCHEMA_VERSION) {
    issues.push({ path: "schemaVersion", message: `Expected schema version ${LEVEL_SCHEMA_VERSION}.` });
  }
  if (!level.id.trim()) issues.push({ path: "id", message: "Level id is required." });
  if (level.revision < 1 || !Number.isInteger(level.revision)) {
    issues.push({ path: "revision", message: "Revision must be a positive integer." });
  }
  if (!level.metadata.name.trim()) issues.push({ path: "metadata.name", message: "Name is required." });
  if (!level.metadata.description.trim()) issues.push({ path: "metadata.description", message: "Description is required." });
  if (level.scene.nativeWidth <= 0 || level.scene.nativeHeight <= 0) {
    issues.push({ path: "scene", message: "Native scene dimensions must be positive." });
  }
  if (!validPoint(level.scene.focalPoint)) {
    issues.push({ path: "scene.focalPoint", message: "Focal point must be normalized." });
  }
  if (level.objects.length === 0) issues.push({ path: "objects", message: "At least one object is required." });

  const ids = new Set<string>();
  level.objects.forEach((object, index) => {
    const path = `objects[${index}]`;
    if (!object.id.trim()) issues.push({ path: `${path}.id`, message: "Object id is required." });
    if (ids.has(object.id)) issues.push({ path: `${path}.id`, message: "Object ids must be unique." });
    ids.add(object.id);
    if (!object.label.trim()) issues.push({ path: `${path}.label`, message: "Label is required." });
    if (level.source === "static" && !object.iconAsset) {
      issues.push({ path: `${path}.iconAsset`, message: "Static targets require an independent icon asset." });
    }
    if (!validRect(object.hitRegion)) {
      issues.push({ path: `${path}.hitRegion`, message: "Hit region must fit inside normalized scene bounds." });
    }
    if (object.focusPoint.y < HUD_SAFE_BOTTOM || object.focusPoint.y > TRAY_SAFE_TOP) {
      issues.push({ path: `${path}.focusPoint`, message: "Target focus point overlaps a persistent gameplay UI safe area." });
    }
    if (!validPoint(object.focusPoint)) {
      issues.push({ path: `${path}.focusPoint`, message: "Focus point must be normalized." });
    }
    if (object.hintRadius <= 0 || object.hintRadius > 1) {
      issues.push({ path: `${path}.hintRadius`, message: "Hint radius must be greater than 0 and no more than 1." });
    }
  });
  return issues;
}

export function assertValidLevel(level: LevelDefinition): LevelDefinition {
  const issues = validateLevel(level);
  if (issues.length > 0) {
    throw new Error(`Invalid level ${level.id}: ${issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}`);
  }
  return level;
}
