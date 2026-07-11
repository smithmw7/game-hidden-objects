import { readFile } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";

const root = path.resolve("public/content/level-001");
const manifest = JSON.parse(await readFile(path.join(root, "assets.json"), "utf8"));
const failures = [];

for (const item of manifest.items) {
  const file = path.join(root, "items", item);
  let png;
  try {
    png = PNG.sync.read(await readFile(file));
  } catch (error) {
    failures.push(`${item}: unreadable PNG (${error instanceof Error ? error.message : "unknown error"})`);
    continue;
  }
  if (png.width !== 256 || png.height !== 256) failures.push(`${item}: expected 256x256, received ${png.width}x${png.height}`);
  let transparent = 0;
  let opaque = 0;
  for (let index = 3; index < png.data.length; index += 4) {
    if (png.data[index] <= 5) transparent += 1;
    if (png.data[index] >= 250) opaque += 1;
  }
  const pixels = png.width * png.height;
  if (transparent / pixels < 0.1) failures.push(`${item}: insufficient transparent background`);
  if (opaque / pixels < 0.08) failures.push(`${item}: insufficient visible subject coverage`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${manifest.items.length} independent transparent item assets.`);
}
