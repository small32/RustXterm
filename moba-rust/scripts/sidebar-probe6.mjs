// sidebar 探针6：ref 文本 bbox（左右缘/上下缘）定字号
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const png = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png")),
);
const W = png.width;
const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const lum = (c) => c[0] + c[1] + c[2];

function tbbox(x0, x1, y0, y1, thr = 350) {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      if (lum(px(x, y)) > thr) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return [minX, minY, maxX, maxY];
}
// User sessions 行 y131-147，文本 x62-220
console.log("User sessions", tbbox(62, 220, 130, 148));
// SDFE y155-172 x90-140
console.log("SDFE", tbbox(90, 140, 154, 172));
// 10.0.0.1 (root) y227-244 x90-200
console.log("10.0.0.1", tbbox(90, 200, 226, 244));
// 103.136.127.158 (root) y251-268 x90-240
console.log("103.136", tbbox(90, 240, 250, 268));
// Test (选中行白字) y203-220 x90-140
console.log("Test", tbbox(90, 140, 202, 220));
