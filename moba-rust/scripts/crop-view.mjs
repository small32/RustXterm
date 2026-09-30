// 裁剪 ref/app 指定区域并 3x 放大保存，供目视
// 用法：node scripts/crop-view.mjs <src:ref|refhome|app|apphome> <x> <y> <w> <h> <out>
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const argv = process.argv.slice(2);
const src = argv[0];
const [x, y, w, h] = argv.slice(1, 5).map(Number);
const out = argv[5];
const SRC = {
  ref: path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png"),
  refhome: path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png"),
  app: path.join(root, ".visual-diff", "app-terminal.png"),
  apphome: path.join(root, ".visual-diff", "app-home.png"),
};
const file = SRC[src] ?? SRC.ref;
const png = PNG.sync.read(fs.readFileSync(file));
const scale = 3;
const o = new PNG({ width: w * scale, height: h * scale });
for (let j = 0; j < h; j++) {
  for (let i = 0; i < w; i++) {
    const si = ((y + j) * png.width + (x + i)) * 4;
    for (let dj = 0; dj < scale; dj++) {
      for (let di = 0; di < scale; di++) {
        const di2 = (((j * scale + dj) * w * scale) + (i * scale + di)) * 4;
        o.data[di2] = png.data[si];
        o.data[di2 + 1] = png.data[si + 1];
        o.data[di2 + 2] = png.data[si + 2];
        o.data[di2 + 3] = 255;
      }
    }
  }
}
fs.writeFileSync(path.join(root, ".visual-diff", out), PNG.sync.write(o));
console.log("saved", out);
