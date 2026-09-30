// 窗口众数色探针：在 ref 的 (x0,y0)-(x1,y1) 内统计非背景色众数
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")));

function mode(x0, y0, x1, y1, bgOk = false) {
  const cnt = new Map();
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = (y * ref.width + x) * 4;
      const c = `#${[ref.data[i], ref.data[i + 1], ref.data[i + 2]].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      if (!bgOk && c === "#1c1c1c") continue;
      cnt.set(c, (cnt.get(c) || 0) + 1);
    }
  return [...cnt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
}

const regions = [
  ["proc0 pid white", 282, 281, 295, 288],
  ["proc0 time white", 736, 281, 750, 288],
  ["proc0 cmd htop", 785, 281, 815, 288],
  ["proc1 cmd init", 785, 296, 860, 303],
  ["header bg", 900, 264, 950, 275, true],
  ["header cpu bg", 648, 264, 700, 275, true],
  ["fkeys bg", 40, 1001, 90, 1010, true],
  ["hl row bg", 900, 981, 950, 990, true],
  ["hl row pid text", 272, 981, 303, 990],
  ["main tab", 248, 247, 280, 258, true],
  ["io tab", 286, 247, 336, 258, true],
  ["mem value", 976, 204, 1055, 215],
  ["info1 value", 1112, 159, 1172, 170],
  ["info0 tasks", 1072, 144, 1116, 155],
  ["info0 28", 1128, 144, 1149, 155],
  ["info0 187", 1184, 144, 1213, 155],
  ["info0 running", 1321, 144, 1374, 155],
];
for (const [name, ...rest] of regions) {
  const bgOk = rest.length === 5;
  const [x0, y0, x1, y1] = rest;
  console.log(name.padEnd(20), JSON.stringify(mode(x0, y0, x1, y1, bgOk)));
}
