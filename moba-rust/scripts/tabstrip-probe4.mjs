// tabstrip 探针4：refhome vs refterm 文本 bbox 对比
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const home = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png")),
);
const term = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);
function bbox(png, x0, x1, y0, y1, thr) {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const i = (y * png.width + x) * 4;
      if (png.data[i] + png.data[i + 1] + png.data[i + 2] > thr) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return [minX, minY, maxX, maxY];
}
console.log("refhome quick text", bbox(home, 4, 236, 100, 121, 350));
console.log("refterm quick text", bbox(term, 4, 236, 100, 121, 350));
console.log("refhome tab text", bbox(home, 320, 450, 100, 121, 300));
console.log("refterm tab text", bbox(term, 320, 450, 100, 121, 300));
