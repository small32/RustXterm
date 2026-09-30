// 测 app 终端视图各元素实际 boundingClientRect
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
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
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1040 } });
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.click("button:has-text('192.168.98.130')");
await page.waitForTimeout(300);
const data = await page.evaluate(() => {
  const cont = document.querySelector(".text-\\[14\\.5px\\]") || document.querySelector("[class*='14.5px']");
  const rows = [...(cont?.children ?? [])].slice(0, 14).map((el) => {
    const r = el.getBoundingClientRect();
    return [el.className.slice(0, 30), Math.round(r.top), Math.round(r.height), (el.textContent || "").slice(0, 24)];
  });
  const cr = cont?.getBoundingClientRect();
  return { cont: cr && [Math.round(cr.top), Math.round(cr.height)], rows };
});
console.log("container", data.cont);
for (const r of data.rows) console.log(r.join(" | "));
await browser.close();
spawn("taskkill", ["/pid", String(proc.pid), "/t", "/f"], { stdio: "ignore" });
