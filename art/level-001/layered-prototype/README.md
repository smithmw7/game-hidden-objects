# Layered static-level prototype

This folder proves the asset split for a manually authored hidden-object level. It does **not** replace the current playable scene yet.

## Authoring passes

1. **Empty environment** — `base-empty.png` contains the room, permanent furniture, lighting, and non-gameplay dressing without findable objects.
2. **Environment occluders** — export foreground shelves, leaves, book lips, cabinet edges, blanket folds, and similar elements as registered transparent PNGs. These render above selected item layers. Complex occluders may have child masks.
3. **Findable scene items** — `items/alpha/*.png` contains registered transparent placement art. The same alpha can provide narrow-phase hit testing; tray art should be derived from this source rather than generated independently.

Every export must retain the Photoshop document's master canvas coordinates or include an explicit trimmed-image registration point. Do not eyeball placement in code.

## Runtime layer order

```text
base environment
rear scene items
midground occlusion layers / masks
midground scene items
foreground occlusion layers / masks
foreground scene items
feedback and debug overlays
```

Each item record should contain its scene position, source size, registration point, depth, optional parent occluder IDs, alpha threshold, and tray crop settings. Hit testing should use a fast bounds check followed by an alpha-mask check. A small configurable touch dilation can preserve mobile usability without accepting the entire bounding rectangle.

## Prototype contents

- `base-empty.png` — AI-edited empty-room proof.
- `items/source/*.png` — flat chroma sources retained for provenance and reprocessing.
- `items/alpha/*.png` — alpha-removed Buddha head, wall key, and ceramic bird placement proofs.
- `manifest.json` — proposed contract. Placement is deliberately marked unregistered until the layers are aligned in the Photoshop master.

## Known limitation

The base plate is a generative reconstruction, not a pixel-identical subtraction. It removed the ten requested gameplay objects successfully, but also altered minor non-target details. Final static levels should therefore be assembled in Photoshop from a clean master document and exported deterministically. AI can supply source art, but it should not be responsible for final layer registration or occlusion masks.
