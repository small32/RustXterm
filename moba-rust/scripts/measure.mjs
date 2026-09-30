// 精确测量参考截图关键区域的元素边界（输出颜色段）
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const shotHome = path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png");
const shotTerm = path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png");

function loadPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}
const home = loadPng(shotHome);
const term = loadPng(shotTerm);

function px(png, x, y) {
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
}
const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");

// 沿一行扫描，输出颜色段（合并相同颜色，忽略 1px 噪声）
function scanRow(png, y, x0, x1, label) {
  const segs = [];
  let cur = hex(px(png, x0, y));
  let start = x0;
  for (let x = x0 + 1; x <= x1; x++) {
    const c = hex(px(png, x, y));
    if (c !== cur) {
      if (x - start >= 2) segs.push(`${start}-${x - 1} ${cur}`);
      cur = c;
      start = x;
    }
  }
  segs.push(`${start}-${x1} ${cur}`);
  console.log(`-- ${label} (y=${y})`);
  console.log(segs.join(" | "));
}

// 沿一列扫描
function scanCol(png, x, y0, y1, label) {
  const segs = [];
  let cur = hex(px(png, x, y0));
  let start = y0;
  for (let y = y0 + 1; y <= y1; y++) {
    const c = hex(px(png, x, y));
    if (c !== cur) {
      if (y - start >= 2) segs.push(`${start}-${y - 1} ${cur}`);
      cur = c;
      start = y;
    }
  }
  segs.push(`${start}-${y1} ${cur}`);
  console.log(`-- ${label} (x=${x})`);
  console.log(segs.join(" | "));
}

// 标签栏：y=110 横穿（输入框/主页签/活动标签/+）
scanRow(home, 110, 0, 1000, "tabstrip y110");
// 标签栏右侧
scanRow(home, 110, 1800, 1919, "tabstrip right y110");
// 侧栏：x=8 纵穿（图标条图标 y 位置）
scanCol(home, 17, 123, 320, "sidebar iconbar x17");
// 侧栏树行：x=60 纵穿找行边界
scanCol(home, 100, 123, 400, "sidebar rows x100");
// 侧栏首行横穿（User sessions 图标/文字 x 起点）
scanRow(home, 135, 36, 240, "sidebar row0 y135");
scanRow(home, 159, 36, 240, "sidebar row1 y159");
scanRow(home, 231, 36, 240, "sidebar row4(Test) y231");
scanRow(home, 255, 36, 240, "sidebar row5(IP) y255");

// SFTP：顶部工具栏 y 范围（x=45 纵穿）
scanCol(term, 45, 123, 260, "sftp col x45");
// SFTP 工具栏图标 y=135 横穿
scanRow(term, 135, 36, 240, "sftp toolbar y135");
// SFTP 图标条 x=17 纵穿
scanCol(term, 17, 123, 400, "sftp iconbar x17");

// 状态栏 y=1026 横穿（元素边界）
scanRow(term, 1026, 244, 1200, "fnbar y1026");

// 终端 htop 顶部：y=130 横穿（CPU 行起点）
scanRow(term, 131, 244, 700, "term cpu0 y131");
// htop 表头带 y 范围（x=300 纵穿）
scanCol(term, 300, 240, 290, "term header x300");
