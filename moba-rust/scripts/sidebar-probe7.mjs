// sidebar 探针7：ref 文本列游程（字符宽特征）+ app 同测对比
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";

function load(f) {
  return PNG.sync.read(fs.readFileSync(f));
}
function runs(png, x0, x1, y0, y1, thr = 350) {
  const out = [];
  let run = null;
  for (let x = x0; x < x1; x++) {
    let ink = 0;
    for (let y = y0; y < y1; y++) {
      const i = (y * png.width + x) * 4;
      if (png.data[i] + png.data[i + 1] + png.data[i + 2] > thr) ink++;
    }
    const on = ink > 0;
    if (on && !run) run = [x, x];
    if (on && run) run[1] = x;
    if (!on && run) {
      out.push(run[1] - run[0] + 1);
      run = null;
    }
  }
  return out;
}

const ref = load(path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png"));
// "User sessions" 行 y131-147 x62-140
console.log("ref User sessions runs:", runs(ref, 62, 140, 131, 147).join(","));
// "103.136.127.158 (root)" y251-268 x90-232
console.log("ref 103.136 runs:", runs(ref, 90, 232, 251, 268).join(","));

const app = load(path.join(root, ".visual-diff", "app-home.png"));
// app 行：user 行 content y7-24 → abs 118-135；文本 x 从 70 起
console.log("app User sessions runs:", runs(app, 70, 160, 118, 135).join(","));
