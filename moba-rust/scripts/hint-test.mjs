// 测不同 Chromium font-render-hinting 对 term-terminal diff 的影响
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);

const proc = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  cwd: root,
  shell: true,
  stdio: "ignore",
});
for (let i = 0; i < 40; i++) {
  try {
    const r = await fetch("http://127.0.0.1:4173/");
    if (r.ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

function rate(app) {
  let bad = 0;
  const w = 1658, h = 892;
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const ai = ((123 + j) * 1920 + (244 + i)) * 4;
      const bi = ((111 + j) * app.width + (244 + i)) * 4;
      if (
        Math.abs(ref.data[ai] - app.data[bi]) > 12 ||
        Math.abs(ref.data[ai + 1] - app.data[bi + 1]) > 12 ||
        Math.abs(ref.data[ai + 2] - app.data[bi + 2]) > 12
      )
        bad++;
    }
  return ((bad / (w * h)) * 100).toFixed(2);
}

for (const hint of ["none", "slight", "medium", "full", ""]) {
  const args = hint ? [`--font-render-hinting=${hint}`] : [];
  const browser = await chromium.launch({ args });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1040 } });
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  await page.click("button:has-text('192.168.98.130')");
  await page.waitForTimeout(300);
  const buf = await page.screenshot();
  const app = PNG.sync.read(buf);
  console.log(`hinting=${hint || "default"}: ${rate(app)}%`);
  await browser.close();
}
spawn("taskkill", ["/pid", String(proc.pid), "/t", "/f"], { stdio: "ignore" });
