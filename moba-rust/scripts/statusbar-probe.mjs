// statusbar y 偏移：ref/app 红叉与文本行 y 范围
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const load = (f) => PNG.sync.read(fs.readFileSync(f));
const ref = load(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png"));
const app = load(path.join(root, ".visual-diff", "app-terminal.png"));

function redY(png, x0, x1) {
  let minY = 9999, maxY = -1;
  for (let y = 1000; y < 1040; y++)
    for (let x = x0; x < x1; x++) {
      const i = (y * png.width + x) * 4;
      if (png.data[i] > 180 && png.data[i + 1] < 90 && png.data[i + 2] < 90) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return [minY, maxY];
}
console.log("ref red", redY(ref, 1890, 1920));
console.log("app red", redY(app, 1890, 1920));

// 文本行 y：debian 图标列 x30-40
function inkY(png, x0, x1) {
  let minY = 9999, maxY = -1;
  for (let y = 1000; y < 1040; y++)
    for (let x = x0; x < x1; x++) {
      const i = (y * png.width + x) * 4;
      if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 300) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return [minY, maxY];
}
console.log("ref debian", inkY(ref, 28, 42));
console.log("app debian", inkY(app, 28, 42));
