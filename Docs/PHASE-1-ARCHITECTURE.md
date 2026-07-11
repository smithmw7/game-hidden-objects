# Phase 1 — Static Game Foundation

## Principle

Static and future dynamic levels produce the same validated `LevelDefinition`. The game runtime never branches on how content was authored.

## Boundaries

- `src/content/schema`: versioned, immutable content contract.
- `src/content/validation`: validation shared by bundled and future generated levels.
- `src/content/repositories`: loading boundary for static, remote, and dynamic sources.
- `src/content/static`: bundled handcrafted level definitions.
- `src/game/runtime`: mutable play-session state and source-image coordinate transforms.
- `src/game/scenes`: Phaser rendering and input only.
- `src/platform/storage`: replaceable local/cloud progression persistence.

## Asset rules

- Scene artwork, thumbnails, object icons, UI chrome, and effects are separate files.
- Art assets contain no text or state-specific labels.
- UI copy remains native text in React or Phaser.
- Runtime coordinates are normalized against the original scene image.
- Replacement assets preserve their declared dimensions or increment the level revision.

## Motion rules

- GSAP is the single animation system for React UI and Phaser game-object feedback.
- Shared durations, eases, reduced-motion handling, and GSAP exports live in `src/motion`.
- Feature code must import GSAP through `src/motion/gsap.ts`, not directly from the package.
- Every animation must be scoped or explicitly killed during React/Phaser teardown.
- The player Reduce Motion setting and the operating-system preference both collapse shared GSAP durations to zero.

## Content safe areas

- Static scenes use `contain` unless a level is explicitly authored for a fixed crop.
- The entire authored scene must remain visible across supported device aspect ratios.
- Persistent HUD and object tray regions must not cover target focus points.
- Level validation rejects targets in persistent vertical UI safe areas.

## Mobile interaction

- `CameraController` owns the 1x to 2.5x camera range and bounded scroll math.
- Zoom button transitions use GSAP; direct pan and pinch input update the camera synchronously.
- Pointer movement beyond the tap tolerance cannot find an object or count as a miss.
- Backgrounding automatically pauses the session and requires an explicit player resume.
- Sound and haptics are routed through `GameFeedback` and respect saved player settings.

## Level 1 package

`Quiet Morning` is the first vertical-slice level. Its scene is bundled at `public/content/level-001/scene.png`; every target references an independent transparent PNG under `public/content/level-001/items`. High-resolution chroma-key sources remain separate under `art/level-001/items/source` and contain no UI or text.

`npm run test:art` validates the runtime item manifest, dimensions, transparency, and visible subject coverage. Replacing an icon does not require editing its UI container or label.

`Golden Hour` (`level-002`) is the architecture proof: it uses a different source resolution and entirely separate scene, thumbnail, manifest, target coordinates, and runtime item files. It is registered through `StaticLevelRepository` and plays through the same React/Phaser runtime without level-specific engine branches.

## Next Phase 1 work

- Author final target regions with an overlay/editor rather than hand-entered estimates.
- Add automated unit tests for validation, session scoring, and coordinate round trips.
- Persist `LevelResult` through `ProgressStore` after the results UX is finalized.
