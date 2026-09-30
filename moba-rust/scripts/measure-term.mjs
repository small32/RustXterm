// 终端区域行剖面测量：对比参考图与实现截图的绿色表头带/亮文字行 y 位置
// 用法：node scripts/measure-term.mjs
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const refTerm = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);
const appTerm = PNG.sync.read(fs.readFileSync(path.join(root, ".visual-diff", "app-terminal.png")));

function profile(png, y0, y1, x0, x1) {
  const rows = [];
  for (let y = y0; y < y1; y++) {
    let green = 0;
    let bright = 0;
    let cyan = 0;
    for (let x = x0; x < x1; x++) {
      const i = (y * png.width + x) * 4;
      const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
      if (g > 100 && g - r > 40 && g - b > 20) green++;
      if (r > 150 && g > 150 && b > 150) bright++;
      if (b > 150 && b - r > 40) cyan++;
    }
    rows.push({ y, green, bright, cyan });
  }
  return rows;
}

// 终端内容区：ref y123-799 x244-1902；app y111-787 x244-1902
const refRows = profile(refTerm, 123, 320, 244, 1902);
const appRows = profile(appTerm, 111, 308, 244, 1902);

function bands(rows, key, min) {
  // 输出连续超过阈值的行带 [start, end, max]
  const out = [];
  let cur = null;
  for (const r of rows) {
    if (r[key] > min) {
      if (!cur) cur = { start: r.y, end: r.y, max: r[key] };
      else { cur.end = r.y; cur.max = Math.max(cur.max, r[key]); }
    } else if (cur) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out;
}

console.log("== 参考图 绿色带（green>800） ==");
console.log(bands(refRows, "green", 800));
console.log("== 实现 绿色带（green>800） ==");
console.log(bands(appRows, "green", 800));
console.log("== 参考图 亮文字行（bright>50）前 20 带 ==");
console.log(bands(refRows, "bright", 50).slice(0, 20));
console.log("== 实现 亮文字行（bright>50）前 20 带 ==");
console.log(bands(appRows, "bright", 50).slice(0, 20));
