// sidebar 探针4：term 截图图标条边框 + 橙圆 bbox
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const png = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);
const W = png.width;
const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const lum = (c) => c[0] + c[1] + c[2];

console.log("== term 图标条 x=17 y123-340 非暗行 ==");
for (let y = 123; y < 340; y++) {
  const c = px(17, y);
  if (lum(c) > 200) console.log(y, hex(c));
}

// 橙圆 bbox
let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
for (let y = 250; y < 330; y++)
  for (let x = 0; x < 35; x++) {
    const c = px(x, y);
    if (c[0] > 150 && c[1] > 80 && c[2] < 100) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
console.log("circle bbox", minX, minY, maxX, maxY);
console.log("circle colors", hex(px(17, 285)), hex(px(12, 280)), hex(px(22, 290)));
