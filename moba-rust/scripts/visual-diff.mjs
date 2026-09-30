// 像素叠图验收脚本（pixel-spec §6）
// 用法：node scripts/visual-diff.mjs
// 1. 启动 vite preview（1920×1040 viewport 截图）
// 2. 与深色套原始截图逐区域比对（按 §8 偏移对齐：截图 chrome 123px ↔ 实现 111px）
// 3. 输出各区域 diff 率与 diff 图到 .visual-diff/
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, ".visual-diff");
fs.mkdirSync(outDir, { recursive: true });

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const shotHome = path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png");
const shotTerm = path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png");

function loadPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function crop(png, x, y, w, h) {
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
  return out;
}

// 逐像素比对，色差阈值 tol；返回 diff 率并生成 diff 图（差异点标红）
function compare(a, b, name, tol = 12) {
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const diff = new PNG({ width: w, height: h });
  let bad = 0;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const ai = (j * a.width + i) * 4;
      const bi = (j * b.width + i) * 4;
      const dr = Math.abs(a.data[ai] - b.data[bi]);
      const dg = Math.abs(a.data[ai + 1] - b.data[bi + 1]);
      const db = Math.abs(a.data[ai + 2] - b.data[bi + 2]);
      const di = (j * w + i) * 4;
      if (dr > tol || dg > tol || db > tol) {
        bad++;
        diff.data[di] = 255;
        diff.data[di + 1] = 0;
        diff.data[di + 2] = 0;
      } else {
        diff.data[di] = a.data[ai];
        diff.data[di + 1] = a.data[ai + 1];
        diff.data[di + 2] = a.data[ai + 2];
      }
      diff.data[di + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(outDir, `diff-${name}.png`), PNG.sync.write(diff));
  const rate = ((bad / (w * h)) * 100).toFixed(2);
  // dilate 指标：双向 ink 覆盖失配（容忍 1px 边缘抖动，剥离抗锯齿引擎差异）
  const ink = (png, ox, oy) => {
    // 背景 = 区域众数色（量化到 16）
    const cnt = new Map();
    for (let j = 0; j < h; j += 2)
      for (let i = 0; i < w; i += 2) {
        const idx = ((oy + j) * png.width + (ox + i)) * 4;
        const k = (png.data[idx] >> 4) + ((png.data[idx + 1] >> 4) << 4) + ((png.data[idx + 2] >> 4) << 8);
        cnt.set(k, (cnt.get(k) || 0) + 1);
      }
    let bk = 0, bn = -1;
    for (const [k, n] of cnt) if (n > bn) { bn = n; bk = k; }
    const bg = [(bk & 15) * 16 + 8, ((bk >> 4) & 15) * 16 + 8, ((bk >> 8) & 15) * 16 + 8];
    const m = new Uint8Array(w * h);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const idx = ((oy + j) * png.width + (ox + i)) * 4;
        const d =
          Math.abs(png.data[idx] - bg[0]) +
          Math.abs(png.data[idx + 1] - bg[1]) +
          Math.abs(png.data[idx + 2] - bg[2]);
        m[j * w + i] = d > 90 ? 1 : 0;
      }
    return m;
  };
  const dil = (m) => {
    const o = new Uint8Array(w * h);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++)
        if (m[j * w + i])
          for (let dj = -1; dj <= 1; dj++)
            for (let di = -1; di <= 1; di++) {
              const y = j + dj, x = i + di;
              if (y >= 0 && y < h && x >= 0 && x < w) o[y * w + x] = 1;
            }
    return o;
  };
  let dilNote = "";
  if (a.width === w && a.height === h) {
    const ma = ink(a, 0, 0);
    const mb = ink(b, 0, 0);
    const da = dil(ma), db = dil(mb);
    let missA = 0, missB = 0;
    for (let k = 0; k < w * h; k++) {
      if (mb[k] && !da[k]) missA++;
      if (ma[k] && !db[k]) missB++;
    }
    dilNote = `  dil=${((Math.max(missA, missB) / (w * h)) * 100).toFixed(2)}%`;
  }
  console.log(`  ${name.padEnd(22)} ${w}x${h}  diff=${rate}%${dilNote}`);
  return parseFloat(rate);
}

// 启动 vite preview 并轮询等待端口可访问（显式绑定 127.0.0.1 避免 IPv6 问题）
async function startPreview() {
  const logFd = fs.openSync(path.join(outDir, "preview.log"), "w");
  const proc = spawn(
    "npx",
    ["vite", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"],
    {
      cwd: root,
      shell: true,
      stdio: ["ignore", logFd, logFd],
    },
  );
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch("http://127.0.0.1:4173/");
      if (res.ok) return proc;
    } catch {
      // 尚未就绪，继续等待
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  killTree(proc);
  throw new Error("preview 启动超时，日志见 .visual-diff/preview.log");
}

// 杀掉 shell 包裹的整个进程树
function killTree(proc) {
  try {
    spawn("taskkill", ["/pid", String(proc.pid), "/t", "/f"], { stdio: "ignore" });
  } catch {
    // 忽略
  }
}

async function capture(page, view, file) {
  if (view === "terminal") {
    // 点击活动标签切换到终端视图
    await page.click("button[aria-label='终端标签']");
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: file });
}

const preview = await startPreview();
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1040 } });
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });

  const appHomeFile = path.join(outDir, "app-home.png");
  const appTermFile = path.join(outDir, "app-terminal.png");
  await capture(page, "home", appHomeFile);
  await capture(page, "terminal", appTermFile);
  await browser.close();

  const appHome = loadPng(appHomeFile);
  const appTerm = loadPng(appTermFile);
  const refHome = loadPng(shotHome);
  const refTerm = loadPng(shotTerm);

  // 对齐关系（§8）：截图 标题栏0–23/菜单23–40/图标行40–72/文字行72–99/标签栏99–123/内容123+
  //                 实现 让位0–28/图标行28–60/文字行60–87/标签栏87–111/内容111+
  console.log("== 主界面（首页视图） vs 深色套截图1 ==");
  compare(crop(refHome, 0, 40, 1920, 32), crop(appHome, 0, 28, 1920, 32), "home-toolbar-icons");
  compare(crop(refHome, 0, 72, 1920, 27), crop(appHome, 0, 60, 1920, 27), "home-toolbar-labels");
  compare(crop(refHome, 0, 99, 1920, 24), crop(appHome, 0, 87, 1920, 24), "home-tabstrip");
  compare(crop(refHome, 0, 123, 244, 889), crop(appHome, 0, 111, 244, 889), "home-sidebar");
  compare(crop(refHome, 244, 123, 1676, 889), crop(appHome, 244, 111, 1676, 889), "home-main");

  console.log("== 终端界面（终端视图） vs 深色套截图2 ==");
  compare(crop(refTerm, 0, 40, 1920, 32), crop(appTerm, 0, 28, 1920, 32), "term-toolbar-icons");
  compare(crop(refTerm, 0, 72, 1920, 27), crop(appTerm, 0, 60, 1920, 27), "term-toolbar-labels");
  compare(crop(refTerm, 0, 99, 1920, 24), crop(appTerm, 0, 87, 1920, 24), "term-tabstrip");
  compare(crop(refTerm, 0, 123, 244, 892), crop(appTerm, 0, 111, 244, 892), "term-sftp");
  compare(crop(refTerm, 244, 123, 1658, 892), crop(appTerm, 244, 111, 1658, 892), "term-terminal");
  compare(crop(refTerm, 0, 1016, 1920, 24), crop(appTerm, 0, 1015, 1920, 24), "statusbar");
} finally {
  killTree(preview);
}
