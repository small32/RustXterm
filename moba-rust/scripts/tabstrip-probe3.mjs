// tabstrip 探针3：app term tabstrip 文本/元素实测
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const png = PNG.sync.read(fs.readFileSync(path.join(root, ".visual-diff", "app-terminal.png")));
const W = png.width;
const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const lum = (c) => c[0] + c[1] + c[2];
const OY = 87;

// y=OY+11 x0-700 变化点（压缩输出：只输出段）
console.log("== app y11 x0-700 段 ==");
let prev = null, segStart = 0;
for (let x = 0; x <= 700; x++) {
  const k = x < 700 ? hex(px(x, OY + 11)) : "END";
  if (k !== prev) {
    if (prev !== null) console.log(`${segStart}-${x - 1} ${prev}`);
    prev = k;
    segStart = x;
  }
}

// 文本 bbox x320-450
let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
for (let y = OY; y < OY + 24; y++)
  for (let x = 320; x < 450; x++) {
    const c = px(x, y);
    if (lum(c) > 400) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y - OY < minY) minY = y - OY;
      if (y - OY > maxY) maxY = y - OY;
    }
  }
console.log("app tab text bbox", minX, minY, maxX, maxY);
console.log("app text colors", hex(px(330, OY + 11)), hex(px(340, OY + 11)), hex(px(360, OY + 11)));
