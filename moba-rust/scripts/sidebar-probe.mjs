// sidebar 探针：ref home 截图，测图标条边框/行 y/图标颜色/滚动条
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
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");

// 1. 图标条水平边框线：x=17 列，y 123..300 的非背景行
console.log("== 图标条 x=17 列 y123-300 非暗行 ==");
for (let y = 123; y < 300; y++) {
  const c = px(17, y);
  if (c[0] + c[1] + c[2] > 200) console.log(y, hex(c));
}

// 2. 图标条右边界 x 扫描 y=300
console.log("== y=300 x30-45 ==");
for (let x = 30; x < 45; x++) console.log(x, hex(px(x, 300)));

// 3. 星中心颜色
console.log("star", hex(px(17, 146)), hex(px(14, 140)), hex(px(22, 150)));
// 4. 行 y 中心：文本列 x 270..500 ink 行游程
console.log("== 文本列行游程 y123-500 ==");
let run = null;
for (let y = 123; y < 500; y++) {
  let ink = 0;
  for (let x = 270; x < 500; x += 2) {
    const c = px(x, y);
    if (c[0] + c[1] + c[2] > 300) ink++;
  }
  const on = ink > 3;
  if (on && !run) run = [y, y];
  if (on && run) run[1] = y;
  if (!on && run) {
    console.log(`row y${run[0]}-${run[1]} c=${((run[0] + run[1]) / 2) | 0}`);
    run = null;
  }
}

// 5. User sessions 图标区颜色 (x38-60, y131-147)
console.log("== user icon 点 ==");
for (const [x, y] of [[40, 133], [45, 133], [50, 137], [48, 141], [42, 143], [55, 135], [38, 131], [48, 131], [44, 136], [52, 143]])
  console.log(x, y, hex(px(x, y)));

// 6. folder 图标 (SDFE 行 y~163) x65-87
console.log("== folder 点 ==");
for (const [x, y] of [[66, 158], [70, 157], [66, 163], [75, 167], [85, 167], [66, 171], [72, 156]])
  console.log(x, y, hex(px(x, y)));

// 7. key box (10.0.0.1 行 y~235) x65-87
console.log("== key box 点 ==");
for (const [x, y] of [[65, 235], [75, 227], [75, 235], [70, 232], [86, 235], [75, 243], [66, 226], [72, 230], [80, 238]])
  console.log(x, y, hex(px(x, y)));

// 8. selected box (Test 行 y~211) 边框
console.log("== selected box ==");
for (const [x, y] of [[63, 211], [116, 211], [90, 200], [90, 222], [70, 211], [100, 211], [64, 201], [115, 221]])
  console.log(x, y, hex(px(x, y)));

// 9. 滚动条：y=500 x220-244
console.log("== y=500 x220-244 ==");
for (let x = 220; x < 244; x++) console.log(x, hex(px(x, 500)));

// 10. 文本颜色
console.log("text", hex(px(280, 139)), hex(px(285, 140)), hex(px(300, 213)));
