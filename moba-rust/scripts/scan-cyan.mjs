// 扫 ref 全宽青底行带
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")));
for (let y = 270; y < 1016; y++) {
  let c = 0;
  for (let x = 244; x < 1900; x += 4) {
    const i = (y * ref.width + x) * 4;
    if (ref.data[i] < 120 && ref.data[i + 1] > 170 && ref.data[i + 2] > 200) c++;
  }
  if (c > 300) console.log(y, c);
}
