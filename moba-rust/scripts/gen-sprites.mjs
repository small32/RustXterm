// 从 ref 截图提取 sidebar 图标 sprite（背景透明化），写入 src/assets/sprites/
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const home = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png")),
);
const term = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);
const outDir = path.join(root, "src", "assets", "sprites");
fs.mkdirSync(outDir, { recursive: true });

// bg: 透明背景色（默认 #141414，lum<=70）；或指定 [r,g,b]+tol
function extract(src, x, y, w, h, name, bg = null, tol = 24) {
  const out = new PNG({ width: w, height: h });
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const si = ((y + j) * src.width + (x + i)) * 4;
      const di = (j * w + i) * 4;
      const r = src.data[si], g = src.data[si + 1], b = src.data[si + 2];
      out.data[di] = r;
      out.data[di + 1] = g;
      out.data[di + 2] = b;
      const isBg =
        bg === "none"
          ? false
          : bg === "lum100"
            ? r + g + b <= 100
            : bg
              ? Math.abs(r - bg[0]) <= tol && Math.abs(g - bg[1]) <= tol && Math.abs(b - bg[2]) <= tol
              : r + g + b <= 70;
      out.data[di + 3] = isBg ? 0 : 255;
    }
  fs.writeFileSync(path.join(outDir, name), PNG.sync.write(out));
  console.log("saved", name, `${w}x${h}`);
}

extract(home, 0, 124, 35, 43, "star.png"); // 星（避开边框 y123/168）
extract(home, 0, 169, 35, 39, "knife.png"); // 瑞士军刀
extract(home, 0, 210, 35, 38, "plane.png"); // 纸飞机
extract(home, 39, 130, 22, 18, "userfolder.png"); // 带人像文件夹
extract(home, 65, 154, 22, 18, "folder.png"); // 蓝文件夹
extract(home, 65, 226, 22, 18, "keybox.png"); // 钥匙框
extract(term, 8, 262, 20, 20, "circle.png"); // 橙圆（sftp）
extract(term, 244, 100, 57, 22, "hometab.png", "lum100"); // 主页签（梯形+图标，背景 #1e1e1e）
extract(term, 536, 99, 34, 23, "plusbtn.png"); // 加号按钮
extract(term, 0, 1016, 1920, 24, "statusbar.png", "none"); // 状态栏整条（不透明）
extract(term, 302, 105, 16, 13, "keybox-sm.png", "lum100"); // 标签内小钥匙框（背景 #1e1e1e）
