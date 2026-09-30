// 输出 ref 指定坐标像素颜色
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")));

function px(x, y) {
  const i = (y * ref.width + x) * 4;
  return `#${[ref.data[i], ref.data[i + 1], ref.data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const probes = [
  ["info0 0.0% dim", 1030, 149],
  ["info0 Tasks cyan", 1080, 149],
  ["info0 13 green", 1130, 149],
  ["info0 187kthr", 1190, 149],
  ["info0 1 green", 1310, 149],
  ["info1 value white", 1140, 164],
  ["Mem value", 1000, 209],
  ["Mem ]", 1061, 209],
  ["Mem seg green", 300, 209],
  ["Mem seg magenta", 355, 209],
  ["Mem seg blue", 363, 209],
  ["Mem seg yellow", 500, 209],
  ["Swp seg", 307, 224],
  ["Swp value", 1000, 224],
  ["proc0 user small32", 320, 284],
  ["proc1 user root", 320, 299],
  ["proc2 user root", 320, 314],
];
for (const [name, x, y] of probes) {
  // 取 3x3 中最亮
  let best = "#000000", bl = -1;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const i = ((y + dy) * ref.width + (x + dx)) * 4;
      const l = ref.data[i] + ref.data[i + 1] + ref.data[i + 2];
      if (l > bl) { bl = l; best = `#${[ref.data[i], ref.data[i + 1], ref.data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`; }
    }
  console.log(`${name.padEnd(22)} ${best}`);
}
