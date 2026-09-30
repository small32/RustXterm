// tabstrip 探针2：home 按钮/tab 左右缘随 y 变化（斜率）
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
const lum = (c) => c[0] + c[1] + c[2];

for (let y = 100; y <= 121; y += 3) {
  // home 左缘：x240-260 首个 lum>100
  let hl = -1;
  for (let x = 240; x < 262; x++) if (lum(px(x, y)) > 100) { hl = x; break; }
  // home/tab 分界：x285-300 中 #545454 结束处
  let hb = -1;
  for (let x = 285; x < 300; x++) {
    const c = px(x, y);
    if (Math.abs(c[0] - 0x54) < 8 && Math.abs(c[1] - 0x54) < 8) hb = x;
  }
  // tab 右缘：x525-540 最后 lum>60
  let tr = -1;
  for (let x = 540; x > 520; x--) if (lum(px(x, y)) > 60) { tr = x; break; }
  // plus 左缘 x532-545
  let pl = -1;
  for (let x = 532; x < 546; x++) if (lum(px(x, y)) > 100) { pl = x; break; }
  console.log(`y${y}: homeL=${hl} homeR=${hb} tabR=${tr} plusL=${pl}`);
}
// 快速连接文字 bbox
let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
for (let y = 100; y < 121; y++)
  for (let x = 4; x < 236; x++) {
    if (lum(px(x, y)) > 350) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
console.log("quick text bbox", minX, minY, maxX, maxY);
// tab 文本 bbox x320-450
minX = 9999; maxX = -1; minY = 9999; maxY = -1;
for (let y = 100; y < 121; y++)
  for (let x = 320; x < 450; x++) {
    if (lum(px(x, y)) > 350) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
console.log("tab text bbox", minX, minY, maxX, maxY);
// home 图标 bbox
minX = 9999; maxX = -1; minY = 9999; maxY = -1;
for (let y = 100; y < 121; y++)
  for (let x = 252; x < 288; x++) {
    const c = px(x, y);
    if (lum(c) > 250 || (c[0] > 150 && c[1] < 100)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
console.log("home icon bbox", minX, minY, maxX, maxY);
