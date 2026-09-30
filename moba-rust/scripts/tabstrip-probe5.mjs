// tabstrip 探针5：ref 快速连接文本列游程
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const png = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);
const W = png.width;
let run = null;
const out = [];
for (let x = 4; x < 236; x++) {
  let ink = 0;
  for (let y = 100; y < 121; y++) {
    const i = (y * W + x) * 4;
    if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 350) ink++;
  }
  const on = ink > 0;
  if (on && !run) run = [x, x];
  if (on && run) run[1] = x;
  if (!on && run) {
    out.push(`${run[0]}-${run[1]}(${run[1] - run[0] + 1})`);
    run = null;
  }
}
console.log(out.join(" "));
