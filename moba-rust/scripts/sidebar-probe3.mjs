// sidebar 探针3：文本左缘（图标右侧起扫）、选中框内底色、轨道色
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
const lum = (c) => c[0] + c[1] + c[2];

function textLeft(x0, x1, yc) {
  for (let x = x0; x < x1; x++) {
    let hit = 0;
    for (let y = yc - 6; y <= yc + 6; y++) if (lum(px(x, y)) > 450) hit++;
    if (hit >= 2) return x;
  }
  return -1;
}
console.log("user textLeft", textLeft(62, 220, 139));
console.log("sdfe textLeft", textLeft(88, 220, 163));
console.log("test textLeft", textLeft(88, 220, 211));
console.log("ip1 textLeft", textLeft(88, 220, 235));

// 选中框内底色（Test 行，文本与图标之间的空隙）
console.log("sel inner", hex(px(92, 205)), hex(px(110, 216)), hex(px(95, 218)), hex(px(108, 204)));
// 选中框边框精确：x 扫描 y211
console.log("== sel box x-scan y211 x60-120 ==");
for (let x = 60; x < 122; x++) {
  const c = px(x, 211);
  if (hex(c).startsWith("#6") || lum(c) > 300) console.log(x, hex(c));
}
// 选中框 y 范围 x63
console.log("== sel box y-scan x63 y196-226 ==");
for (let y = 196; y < 226; y++) console.log(y, hex(px(63, y)));

// 滚动条轨道 y900 x224-232
console.log("== track y900 ==");
for (let x = 224; x < 233; x++) console.log(x, hex(px(x, 900)));
// 树背景（无内容区）
console.log("tree bg", hex(px(150, 950)), hex(px(100, 700)));
// user 图标细节行扫描 y138
console.log("== usericon y138 x38-61 ==");
for (let x = 38; x < 61; x++) console.log(x, hex(px(x, 138)));
