// 带状列剖面：对每个文字行带（12px 高）按列累计非背景像素，取游程 → 字段 x 范围
// 用法：node scripts/compare-rows.mjs
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")));
const app = PNG.sync.read(fs.readFileSync(path.join(root, ".visual-diff", "app-terminal.png")));

function bandRuns(png, y0, y1, x0, x1, minCount = 1, gap = 3) {
  const col = new Array(x1 - x0 + 1).fill(0);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * png.width + x) * 4;
      if (Math.max(png.data[i], png.data[i + 1], png.data[i + 2]) > 70) col[x - x0]++;
    }
  }
  const out = [];
  let start = -1, gapN = 0;
  for (let k = 0; k < col.length; k++) {
    if (col[k] >= minCount) {
      if (start < 0) start = k;
      gapN = 0;
    } else if (start >= 0) {
      gapN++;
      if (gapN > gap) {
        out.push([x0 + start, x0 + k - gapN]);
        start = -1;
        gapN = 0;
      }
    }
  }
  if (start >= 0) out.push([x0 + start, x1]);
  return out;
}

// 行带（ref y0..y1）：info0/info1/info2/info3/Mem/Swp/header/proc0/proc1
const bands = [
  ["info0", 144, 155],
  ["info1", 159, 170],
  ["info2", 174, 185],
  ["info3", 189, 200],
  ["Mem", 204, 215],
  ["Swp", 219, 230],
  ["header", 262, 277],
  ["proc0", 279, 290],
  ["proc1", 294, 305],
  ["proc2", 309, 320],
];

for (const [name, ry0, ry1] of bands) {
  const ay0 = ry0 - 13, ay1 = ry1 - 13;
  const rr = bandRuns(ref, ry0, ry1, 244, 1900);
  const ar = bandRuns(app, ay0, ay1, 244, 1900);
  console.log(`\n== ${name} ==`);
  console.log(" ref:", rr.map((r) => `${r[0]}-${r[1]}`).join(" "));
  console.log(" app:", ar.map((r) => `${r[0]}-${r[1]}`).join(" "));
}
