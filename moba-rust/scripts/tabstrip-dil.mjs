// tabstrip dil 诊断：ink 统计与失配定位
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const load = (f) => PNG.sync.read(fs.readFileSync(f));
const refTerm = load(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png"));
const refHome = load(path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png"));
const appTerm = load(path.join(root, ".visual-diff", "app-terminal.png"));
const appHome = load(path.join(root, ".visual-diff", "app-home.png"));

function ink(png, ox, oy, w, h) {
  const cnt = new Map();
  for (let j = 0; j < h; j += 2)
    for (let i = 0; i < w; i += 2) {
      const idx = ((oy + j) * png.width + (ox + i)) * 4;
      const k = (png.data[idx] >> 4) + ((png.data[idx + 1] >> 4) << 4) + ((png.data[idx + 2] >> 4) << 8);
      cnt.set(k, (cnt.get(k) || 0) + 1);
    }
  let bk = 0, bn = -1;
  for (const [k, n] of cnt) if (n > bn) { bn = n; bk = k; }
  const bg = [(bk & 15) * 16 + 8, ((bk >> 4) & 15) * 16 + 8, ((bk >> 8) & 15) * 16 + 8];
  const m = new Uint8Array(w * h);
  let n = 0;
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const idx = ((oy + j) * png.width + (ox + i)) * 4;
      const d = Math.abs(png.data[idx] - bg[0]) + Math.abs(png.data[idx + 1] - bg[1]) + Math.abs(png.data[idx + 2] - bg[2]);
      if (d > 90) { m[j * w + i] = 1; n++; }
    }
  return { m, bg, n };
}

function inkCount(png, x, y, w, h, bg, thr = 90) {
  let n = 0;
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const idx = ((y + j) * png.width + (x + i)) * 4;
      const d = Math.abs(png.data[idx] - bg[0]) + Math.abs(png.data[idx + 1] - bg[1]) + Math.abs(png.data[idx + 2] - bg[2]);
      if (d > thr) n++;
    }
  return n;
}
const BG = [24, 24, 24];
// tab 文本区 / 快速连接区 / 全带
for (const [name, png] of [["refTerm", refTerm], ["refHome", refHome], ["appTerm", appTerm], ["appHome", appHome]]) {
  console.log(
    name,
    "tabText", inkCount(png, 300, 100, 150, 22, BG),
    "quick", inkCount(png, 4, 100, 234, 22, BG),
    "right", inkCount(png, 450, 100, 250, 22, BG),
  );
}
