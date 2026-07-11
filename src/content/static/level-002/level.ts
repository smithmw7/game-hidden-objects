import { LEVEL_SCHEMA_VERSION, type LevelDefinition } from "../../schema/level";

export const goldenHourLevel: LevelDefinition = {
  schemaVersion: LEVEL_SCHEMA_VERSION,
  id: "level-002",
  source: "static",
  revision: 1,
  metadata: {
    name: "Golden Hour",
    chapter: "City Light",
    description: "The last sunlight warms a room above the city. Find the objects tucked into shelves, windows and soft corners.",
    difficulty: "easy",
    estimatedSeconds: 210
  },
  scene: {
    imageAsset: "content/level-002/scene.png",
    thumbnailAsset: "content/level-002/thumbnail.png",
    nativeWidth: 1024,
    nativeHeight: 1536,
    fitMode: "cover",
    focalPoint: { x: 0.52, y: 0.52 }
  },
  rules: {
    mode: "untimed",
    incorrectTapPenaltySeconds: 0,
    availableHints: 3,
    scoreThresholds: { oneStar: 1, twoStars: 1030, threeStars: 1225 }
  },
  objects: [
    { id: "sailboat", label: "Sailboat", hitRegion: { x: 0.29, y: 0.055, width: 0.14, height: 0.12 }, focusPoint: { x: 0.36, y: 0.115 }, difficulty: 1, hintRadius: 0.09, accessibilityLabel: "Wooden model sailboat on the top shelf", iconAsset: "content/level-002/items/sailboat.png" },
    { id: "globe", label: "Globe", hitRegion: { x: 0.33, y: 0.3, width: 0.09, height: 0.09 }, focusPoint: { x: 0.375, y: 0.345 }, difficulty: 2, hintRadius: 0.08, accessibilityLabel: "Small globe on the bookshelf", iconAsset: "content/level-002/items/globe.png" },
    { id: "camera", label: "Camera", hitRegion: { x: 0.54, y: 0.455, width: 0.08, height: 0.06 }, focusPoint: { x: 0.58, y: 0.485 }, difficulty: 2, hintRadius: 0.07, accessibilityLabel: "Vintage camera on the windowsill", iconAsset: "content/level-002/items/camera.png" },
    { id: "lantern", label: "Lantern", hitRegion: { x: 0.66, y: 0.445, width: 0.07, height: 0.085 }, focusPoint: { x: 0.695, y: 0.487 }, difficulty: 2, hintRadius: 0.07, accessibilityLabel: "Brass lantern on the windowsill", iconAsset: "content/level-002/items/lantern.png" },
    { id: "owl", label: "Owl", hitRegion: { x: 0.27, y: 0.5, width: 0.065, height: 0.075 }, focusPoint: { x: 0.302, y: 0.537 }, difficulty: 1, hintRadius: 0.07, accessibilityLabel: "Small owl figure beside the television", iconAsset: "content/level-002/items/owl.png" },
    { id: "watering-can", label: "Watering Can", hitRegion: { x: 0.425, y: 0.55, width: 0.08, height: 0.105 }, focusPoint: { x: 0.465, y: 0.602 }, difficulty: 2, hintRadius: 0.08, accessibilityLabel: "Green watering can on the floor", iconAsset: "content/level-002/items/watering-can.png" },
    { id: "cup", label: "Cup", hitRegion: { x: 0.84, y: 0.49, width: 0.065, height: 0.065 }, focusPoint: { x: 0.872, y: 0.522 }, difficulty: 2, hintRadius: 0.07, accessibilityLabel: "Cream cup on the windowsill", iconAsset: "content/level-002/items/cup.png" },
    { id: "teddy", label: "Teddy", hitRegion: { x: 0.785, y: 0.61, width: 0.1, height: 0.12 }, focusPoint: { x: 0.835, y: 0.67 }, difficulty: 1, hintRadius: 0.09, accessibilityLabel: "Brown teddy bear on the sofa", iconAsset: "content/level-002/items/teddy.png" },
    { id: "key", label: "Key", hitRegion: { x: 0.245, y: 0.775, width: 0.075, height: 0.06 }, focusPoint: { x: 0.282, y: 0.805 }, difficulty: 1, hintRadius: 0.08, accessibilityLabel: "Brass key on the wooden floor", iconAsset: "content/level-002/items/key.png" },
    { id: "magnifier", label: "Magnifier", hitRegion: { x: 0.075, y: 0.82, width: 0.085, height: 0.095 }, focusPoint: { x: 0.117, y: 0.867 }, difficulty: 1, hintRadius: 0.08, accessibilityLabel: "Magnifying glass near the scratching post", iconAsset: "content/level-002/items/magnifier.png" }
  ]
};
