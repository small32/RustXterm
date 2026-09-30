// 扫 ref/app 全宽绿带与青带 y 范围
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")));
const app = PNG.sync.read(fs.readFileSync(path.join(root, ".visual-diff", "app-terminal.png")));

function bands(png, kind) {
  const out = [];
  for (let y = 100; y < png.height; y++) {
    let c = 0;
    for (let x = 300; x < 1800; x += 4) {
      const i = (y * png.width + x) * 4;
      const [r, g, b] = [png.data[i], png.data[i + 1], png.data[i + 2]];
      const hit =
        kind === "green" ? g > 140 && r < 100 && b < 140 : b > 200 && g > 170 && r < 120;
      if (hit) c++;
    }
    if (c > 300) out.push(y);
  }
  // 压缩成区间
  const ranges = [];
  for (const y of out) {
    const last = ranges[ranges.length - 1];
    if (last && y === last[1] + 1) last[1] = y;
    else ranges.push([y, y]);
  }
  return ranges;
}

console.log("ref green:", bands(ref, "green").map((r) => r.join("-")).join(" "));
console.log("app green:", bands(app, "green").map((r) => r.join("-")).join(" "));
console.log("ref cyan :", bands(ref, "cyan").map((r) => r.join("-")).join(" "));
console.log("app cyan :", bands(app, "cyan").map((r) => r.join("-")).join(" "));
