import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";

const failures = [];
let validated = 0;
const contentRoot = path.resolve("public/content");
const levelFolders = (await readdir(contentRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("level-"))
  .map((entry) => entry.name)
  .sort();

for (const folder of levelFolders) {
  const root = path.join(contentRoot, folder);
  const manifest = JSON.parse(await readFile(path.join(root, "assets.json"), "utf8"));
  if (manifest.levelId !== folder) failures.push(`${folder}: manifest levelId mismatch`);
  for (const [kind, filename, expected] of [
    ["scene", manifest.scene, manifest.sceneSize],
    ["thumbnail", manifest.thumbnail, manifest.thumbnailSize]
  ]) {
    try {
      const png = PNG.sync.read(await readFile(path.join(root, filename)));
      if (png.width !== expected[0] || png.height !== expected[1]) {
        failures.push(`${folder}/${kind}: expected ${expected.join("x")}, received ${png.width}x${png.height}`);
      }
    } catch (error) {
      failures.push(`${folder}/${kind}: unreadable PNG (${error instanceof Error ? error.message : "unknown error"})`);
    }
  }
  for (const item of manifest.items) {
    const file = path.join(root, "items", item);
    let png;
    try {
      png = PNG.sync.read(await readFile(file));
    } catch (error) {
      failures.push(`${folder}/${item}: unreadable PNG (${error instanceof Error ? error.message : "unknown error"})`);
      continue;
    }
    if (png.width !== 256 || png.height !== 256) failures.push(`${folder}/${item}: expected 256x256, received ${png.width}x${png.height}`);
    let transparent = 0;
    let opaque = 0;
    for (let index = 3; index < png.data.length; index += 4) {
      if (png.data[index] <= 5) transparent += 1;
      if (png.data[index] >= 250) opaque += 1;
    }
    const pixels = png.width * png.height;
    if (transparent / pixels < 0.1) failures.push(`${folder}/${item}: insufficient transparent background`);
    if (opaque / pixels < 0.08) failures.push(`${folder}/${item}: insufficient visible subject coverage`);
    validated += 1;
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${validated} independent transparent item assets across ${levelFolders.length} levels.`);
}
