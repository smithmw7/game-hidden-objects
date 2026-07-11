import { LEVEL_SCHEMA_VERSION, type LevelDefinition } from "../../schema/level";

export const quietMorningLevel: LevelDefinition = {
  schemaVersion: LEVEL_SCHEMA_VERSION,
  id: "level-001",
  source: "static",
  revision: 1,
  metadata: {
    name: "Quiet Morning",
    chapter: "At Home",
    description: "Morning light has settled across the room. Find the small keepsakes hidden among its quiet details.",
    difficulty: "tutorial",
    estimatedSeconds: 180
  },
  scene: {
    imageAsset: "content/level-001/scene.png",
    thumbnailAsset: "content/level-001/thumbnail.png",
    nativeWidth: 1085,
    nativeHeight: 1450,
    fitMode: "contain",
    focalPoint: { x: 0.52, y: 0.53 }
  },
  rules: {
    mode: "untimed",
    incorrectTapPenaltySeconds: 0,
    availableHints: 3,
    scoreThresholds: { oneStar: 1, twoStars: 1050, threeStars: 1250 }
  },
  objects: [
    { id: "buddha", label: "Buddha", hitRegion: { x: 0.19, y: 0.315, width: 0.11, height: 0.12 }, focusPoint: { x: 0.245, y: 0.375 }, difficulty: 1, hintRadius: 0.09, accessibilityLabel: "Small Buddha figure on the cabinet", iconAsset: "content/level-001/items/buddha.png" },
    { id: "key", label: "Key", hitRegion: { x: 0.415, y: 0.14, width: 0.055, height: 0.085 }, focusPoint: { x: 0.443, y: 0.182 }, difficulty: 1, hintRadius: 0.08, accessibilityLabel: "Brass key hanging on the wall", iconAsset: "content/level-001/items/key.png" },
    { id: "bird", label: "Bird", hitRegion: { x: 0.44, y: 0.385, width: 0.07, height: 0.055 }, focusPoint: { x: 0.475, y: 0.413 }, difficulty: 1, hintRadius: 0.08, accessibilityLabel: "Blue bird beside the plant", iconAsset: "content/level-001/items/bird.png" },
    { id: "frog", label: "Frog", hitRegion: { x: 0.83, y: 0.405, width: 0.055, height: 0.07 }, focusPoint: { x: 0.857, y: 0.44 }, difficulty: 2, hintRadius: 0.07, accessibilityLabel: "Green frog on the bookshelf", iconAsset: "content/level-001/items/frog.png" },
    { id: "owl", label: "Owl", hitRegion: { x: 0.065, y: 0.59, width: 0.075, height: 0.09 }, focusPoint: { x: 0.102, y: 0.635 }, difficulty: 2, hintRadius: 0.08, accessibilityLabel: "Owl in the dark plant pot", iconAsset: "content/level-001/items/owl.png" },
    { id: "turtle", label: "Turtle", hitRegion: { x: 0.15, y: 0.695, width: 0.075, height: 0.055 }, focusPoint: { x: 0.188, y: 0.722 }, difficulty: 2, hintRadius: 0.08, accessibilityLabel: "Small turtle below the plant", iconAsset: "content/level-001/items/turtle.png" },
    { id: "feather", label: "Feather", hitRegion: { x: 0.405, y: 0.66, width: 0.105, height: 0.055 }, focusPoint: { x: 0.457, y: 0.687 }, difficulty: 2, hintRadius: 0.08, accessibilityLabel: "Brown feather on the chair blanket", iconAsset: "content/level-001/items/feather.png" },
    { id: "envelope", label: "Envelope", hitRegion: { x: 0.865, y: 0.605, width: 0.095, height: 0.065 }, focusPoint: { x: 0.912, y: 0.638 }, difficulty: 2, hintRadius: 0.08, accessibilityLabel: "Cream envelope on the bookshelf", iconAsset: "content/level-001/items/envelope.png" },
    { id: "gnome", label: "Gnome", hitRegion: { x: 0.69, y: 0.79, width: 0.065, height: 0.11 }, focusPoint: { x: 0.722, y: 0.845 }, difficulty: 1, hintRadius: 0.08, accessibilityLabel: "Red-hatted gnome near the chair", iconAsset: "content/level-001/items/gnome.png" },
    { id: "magnifier", label: "Magnifier", hitRegion: { x: 0.28, y: 0.82, width: 0.16, height: 0.1 }, focusPoint: { x: 0.36, y: 0.87 }, difficulty: 1, hintRadius: 0.1, accessibilityLabel: "Magnifying glass on the table", iconAsset: "content/level-001/items/magnifier.png" }
  ]
};
