// 裁剪参考截图关键区域，供肉眼读取真实文字内容（pixel-spec §7 未确认项）
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, ".visual-diff", "ref-crops");
fs.mkdirSync(outDir, { recursive: true });

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const shotHome = path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png");
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

const home = loadPng(shotHome);
const term = loadPng(shotTerm);

// 主界面：工具栏左 11 键（图标+文字）、工具栏右侧 2 键、标签栏、侧栏上部、首页中部
cropSave(home, 0, 40, 620, 59, "home-toolbar-left");
cropSave(home, 1780, 40, 140, 59, "home-toolbar-right");
cropSave(home, 0, 99, 620, 24, "home-tabstrip-left");
cropSave(home, 1850, 99, 70, 24, "home-tabstrip-right");
cropSave(home, 0, 123, 244, 300, "home-sidebar-top");
cropSave(home, 780, 420, 620, 280, "home-center");

// 终端界面：SFTP 面板上部、终端文本上部、功能键栏
cropSave(term, 0, 123, 244, 220, "term-sftp-top");
cropSave(term, 244, 123, 800, 300, "term-text-top");
cropSave(term, 244, 1015, 800, 24, "term-fnbar");
