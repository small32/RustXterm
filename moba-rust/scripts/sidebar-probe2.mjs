// sidebar 探针2：文本左缘/颜色、箭头、滚动条范围、图标 bbox
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

// 1. 行游程（文本列 x60-200）
console.log("== 行游程 x60-200 ==");
let run = null;
for (let y = 123; y < 1012; y++) {
  let ink = 0;
  for (let x = 60; x < 200; x += 2) if (lum(px(x, y)) > 300) ink++;
  const on = ink > 2;
  if (on && !run) run = [y, y];
  if (on && run) run[1] = y;
  if (!on && run) {
    console.log(`row y${run[0]}-${run[1]}`);
    run = null;
  }
}

// 2. 文本左缘：各行首个亮像素 x
for (const [label, yc] of [["user", 139], ["sdfe", 163], ["small32", 187], ["test", 211], ["ip1", 235], ["ip2", 259]]) {
  let lx = -1;
  for (let x = 40; x < 220; x++) {
    let hit = false;
    for (let y = yc - 6; y <= yc + 6; y++) if (lum(px(x, y)) > 400) { hit = true; break; }
    if (hit) { lx = x; break; }
  }
  console.log(label, "textLeft", lx);
}

// 3. 文本颜色采样（User sessions 笔画）
console.log("== 文本色 ==");
for (const [x, y] of [[70, 138], [72, 140], [80, 139], [95, 235], [100, 236], [93, 163]])
  console.log(x, y, hex(px(x, y)));

// 4. 箭头 ">" (SDFE 行 x45-52, y163)
console.log("== 箭头 ==");
for (let x = 42; x < 58; x++) {
  const c = px(x, 163);
  if (lum(c) > 200) console.log(x, 163, hex(c));
}
for (let y = 156; y < 172; y++) {
  const c = px(48, y);
  if (lum(c) > 200) console.log(48, y, hex(c));
}

// 5. 滚动条拇指 y 范围 x227
console.log("== 滚动条 x227 y123-1012 ==");
let srun = null;
for (let y = 123; y < 1012; y++) {
  const on = lum(px(227, y)) > 300;
  if (on && !srun) srun = [y, y];
  if (on && srun) srun[1] = y;
  if (!on && srun) {
    console.log(`thumb y${srun[0]}-${srun[1]}`);
    srun = null;
  }
}

// 6. 图标 bbox（非背景像素范围）
function bbox(x0, x1, y0, y1, thr = 120) {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const c = px(x, y);
      if (lum(c) > thr) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return [minX, minY, maxX, maxY];
}
console.log("star bbox", bbox(2, 34, 126, 166));
console.log("knife bbox", bbox(2, 34, 170, 208));
console.log("plane bbox", bbox(2, 34, 212, 250));
console.log("usericon bbox", bbox(36, 62, 128, 150));
console.log("folder bbox", bbox(63, 90, 152, 175));
console.log("keybox bbox", bbox(63, 90, 224, 246, 100));

// 7. 背景色
console.log("iconbar bg", hex(px(17, 300)), "tree bg", hex(px(150, 500)), "sep", hex(px(241, 500)));
