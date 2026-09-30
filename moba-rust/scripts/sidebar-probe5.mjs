// sidebar 探针5：app-home.png 同口径测量（y 减 111 得 content 坐标）
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const png = PNG.sync.read(fs.readFileSync(path.join(root, ".visual-diff", "app-home.png")));
const W = png.width;
const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const lum = (c) => c[0] + c[1] + c[2];
const OY = 111;

// 1. 图标条 x17 列
console.log("== app x17 y111-450 非暗行 ==");
for (let y = OY; y < OY + 330; y++) {
  const c = px(17, y);
  if (lum(c) > 200) console.log(y - OY, hex(c));
}

// 2. 行游程 x60-200
console.log("== app 行游程 ==");
let run = null;
for (let y = OY; y < OY + 200; y++) {
  let ink = 0;
  for (let x = 60; x < 200; x += 2) if (lum(px(x, y)) > 300) ink++;
  const on = ink > 2;
  if (on && !run) run = [y, y];
  if (on && run) run[1] = y;
  if (!on && run) {
    console.log(`row y${run[0] - OY}-${run[1] - OY}`);
    run = null;
  }
}

// 3. 文本左缘
function textLeft(x0, x1, yc) {
  for (let x = x0; x < x1; x++) {
    let hit = 0;
    for (let y = yc - 6; y <= yc + 6; y++) if (lum(px(x, y)) > 450) hit++;
    if (hit >= 2) return x;
  }
  return -1;
}
console.log("user textLeft", textLeft(62, 220, OY + 16));
console.log("ip1 textLeft", textLeft(88, 220, OY + 112));

// 4. 滚动条 x 扫描 content y500
console.log("== app y=OY+500 x220-244 ==");
for (let x = 220; x < 244; x++) console.log(x, hex(px(x, OY + 500)));

// 5. 选中框 x-scan content y211-111? Test 行 content top 76 → y=OY+88
console.log("== app sel box x-scan y=OY+88 x60-120 ==");
for (let x = 60; x < 122; x++) {
  const c = px(x, OY + 88);
  if (lum(c) > 300) console.log(x, hex(c));
}

// 6. user 图标 bbox
let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
for (let y = OY; y < OY + 30; y++)
  for (let x = 36; x < 62; x++) {
    const c = px(x, y);
    if (lum(c) > 120) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y - OY < minY) minY = y - OY;
      if (y - OY > maxY) maxY = y - OY;
    }
  }
console.log("app usericon bbox", minX, minY, maxX, maxY);
