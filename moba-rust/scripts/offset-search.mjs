// 在 ref 截图上搜索相对 app 截图的最优平移偏移（dx,dy），最小化 bad 率
// 用法：node scripts/offset-search.mjs [region]
// region: term-terminal | home-sidebar | statusbar | term-tabstrip
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const refTerm = PNG.sync.read(fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")));
const refHome = PNG.sync.read(fs.readFileSync(path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png")));
const appTerm = PNG.sync.read(fs.readFileSync(path.join(root, ".visual-diff", "app-terminal.png")));
const appHome = PNG.sync.read(fs.readFileSync(path.join(root, ".visual-diff", "app-home.png")));

const REGIONS = {
  "term-terminal": { ref: refTerm, app: appTerm, rx: 244, ry: 123, ax: 244, ay: 111, w: 1658, h: 892 },
  "home-sidebar": { ref: refHome, app: appHome, rx: 0, ry: 123, ax: 0, ay: 111, w: 244, h: 889 },
  "statusbar": { ref: refTerm, app: appTerm, rx: 0, ry: 1016, ax: 0, ay: 1015, w: 1920, h: 24 },
  "term-tabstrip": { ref: refTerm, app: appTerm, rx: 0, ry: 99, ax: 0, ay: 87, w: 1920, h: 24 },
};

const region = process.argv[2] || "term-terminal";
const R = REGIONS[region];
const tol = 12;

function badAt(dx, dy) {
  let bad = 0;
  const w = R.w, h = R.h;
  for (let j = 0; j < h; j++) {
    const ry = R.ry + dy + j;
    const ay = R.ay + j;
    if (ry < 0 || ry >= R.ref.height || ay < 0 || ay >= R.app.height) { bad += w; continue; }
    for (let i = 0; i < w; i++) {
      const rx = R.rx + dx + i;
      const ax = R.ax + i;
      if (rx < 0 || rx >= R.ref.width || ax < 0 || ax >= R.app.width) { bad++; continue; }
      const ai = (ry * R.ref.width + rx) * 4;
      const bi = (ay * R.app.width + ax) * 4;
      if (
        Math.abs(R.ref.data[ai] - R.app.data[bi]) > tol ||
        Math.abs(R.ref.data[ai + 1] - R.app.data[bi + 1]) > tol ||
        Math.abs(R.ref.data[ai + 2] - R.app.data[bi + 2]) > tol
      ) bad++;
    }
  }
  return bad / (w * h);
}

let best = null;
for (let dy = -10; dy <= 10; dy++) {
  for (let dx = -10; dx <= 10; dx++) {
    const b = badAt(dx, dy);
    if (!best || b < best.b) best = { dx, dy, b };
  }
}
console.log(`${region}: best dx=${best.dx} dy=${best.dy} bad=${(best.b * 100).toFixed(2)}%`);
// 打印 dy 列剖面（dx=best.dx）
for (let dy = -6; dy <= 6; dy++) {
  console.log(`  dy=${dy >= 0 ? "+" : ""}${dy}  ${(badAt(best.dx, dy) * 100).toFixed(2)}%`);
}
