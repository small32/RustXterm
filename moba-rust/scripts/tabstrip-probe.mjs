// tabstrip 探针：ref term 截图 y99-123，x0-700
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

function colScan(x, y0, y1) {
  console.log(`== col x${x} y${y0}-${y1} ==`);
  let prev = null;
  for (let y = y0; y < y1; y++) {
    const k = hex(px(x, y));
    if (k !== prev) console.log(y, k);
    prev = k;
  }
}
colScan(2, 99, 123); // 快速连接框内
colScan(260, 99, 123); // home 按钮
colScan(400, 99, 123); // tab 背景
colScan(600, 99, 123); // tab 右 / 加号

// y111 x300-700 变化点（tab 右缘/加号）
console.log("== y111 x300-700 ==");
let prev = null;
for (let x = 300; x < 700; x++) {
  const k = hex(px(x, 111));
  if (k !== prev) console.log(x, k);
  prev = k;
}
