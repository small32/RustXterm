// sidebar 字体互相关：渲染 "User sessions" 与 ref [67,131]x[133,144] 二值互相关
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "09e8b768-39be-4e62-9c03-8ddd45d9619b_b1734bbc-fc67-4d21-bd73-97fbc8997dba_image.png")),
);
const TEXT = "User sessions";
const RX = 67, RY = 133, RW = 65, RH = 12;

const cands = [];
for (const fam of ["Segoe UI", "Tahoma", "Verdana", "Arial", "Consolas", "Meiryo", "MS Gothic", "Lucida Sans", "Trebuchet MS", "Segoe UI Semilight"])
  for (let size = 9; size <= 13.5; size += 0.5) cands.push([fam, size]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 200, height: 30 } });
const results = [];
for (const [fam, size] of cands) {
  await page.setContent(
    `<body style="margin:0;background:#141414"><div id="t" style="font-family:'${fam}';font-size:${size}px;line-height:${RH}px;color:#d3d3d3;white-space:pre">${TEXT}</div></body>`,
  );
  await page.waitForTimeout(15);
  const shot = PNG.sync.read(await page.locator("#t").screenshot());
  let best = null;
  for (let dy = -6; dy <= 6; dy++)
    for (let dx = -4; dx <= 4; dx++) {
      let bad = 0, tot = 0;
      for (let j = 0; j < RH; j++)
        for (let i = 0; i < RW; i++) {
          const ry = RY + j, rx = RX + i;
          const sy = j - dy, sx = i - dx;
          if (sy < 0 || sy >= shot.height || sx < 0 || sx >= shot.width) continue;
          const si = (sy * shot.width + sx) * 4, ri = (ry * ref.width + rx) * 4;
          tot++;
          const la = (shot.data[si] + shot.data[si + 1] + shot.data[si + 2]) / 3 > 110;
          const lb = (ref.data[ri] + ref.data[ri + 1] + ref.data[ri + 2]) / 3 > 110;
          if (la !== lb) bad++;
        }
      if (!best || bad < best.bad) best = { dx, dy, bad, tot };
    }
  results.push([fam, size, best]);
}
results.sort((a, b) => a[2].bad - b[2].bad);
for (const [fam, size, b] of results.slice(0, 10))
  console.log(`${fam} ${size}px: bad=${((b.bad / b.tot) * 100).toFixed(1)}% dx=${b.dx} dy=${b.dy}`);
await browser.close();
