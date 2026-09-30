// 裁剪终端区全文，供读取 htop 完整输出
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, ".visual-diff", "ref-crops");
fs.mkdirSync(outDir, { recursive: true });

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const shotTerm = path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png");

function loadPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}
function cropSave(png, x, y, w, h, name) {
  const out = new PNG({ width: w, height: h });
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const si = ((y + j) * png.width + (x + i)) * 4;
      const di = (j * w + i) * 4;
      out.data[di] = png.data[si];
      out.data[di + 1] = png.data[si + 1];
      out.data[di + 2] = png.data[si + 2];
      out.data[di + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(outDir, `${name}.png`), PNG.sync.write(out));
  console.log(`saved ${name}.png`);
}

const term = loadPng(shotTerm);
cropSave(term, 244, 123, 1658, 155, "term-top-full");
cropSave(term, 244, 278, 1658, 368, "term-procs-1");
cropSave(term, 244, 646, 1658, 368, "term-procs-2");
