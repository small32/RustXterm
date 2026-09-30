// 字形匹配：渲染长 cmd 文本与 ref proc2 cmd 区 [784,1050]x[308,321] 二值互相关，找最佳字体/字号
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);

const TEXT = "/usr/lib/systemd/systemd-journald";
const RX = 784, RY = 308, RW = 268, RH = 14;

const candidates = [];
for (const fam of ["Consolas", "Cascadia Mono", "Segoe UI Mono", "Lucida Console", "Menlo", "Monaco"])
  for (let size = 13.5; size <= 15.5; size += 0.5)
    for (const weight of [400, 600, 700]) candidates.push([fam, size, weight]);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 40 } });

const results = [];
for (const [fam, size, weight] of candidates) {
  await page.setContent(
    `<body style="margin:0;background:#1c1c1c"><div id="t" style="font-family:'${fam}',monospace;font-size:${size}px;font-weight:${weight ?? 400};line-height:${RH}px;color:#ececec;white-space:pre">${TEXT}</div></body>`,
  );
  await page.waitForTimeout(20);
  const buf = await page.locator("#t").screenshot();
  const shot = PNG.sync.read(buf);
  let best = null;
  for (let dy = -4; dy <= 4; dy++)
    for (let dx = -4; dx <= 4; dx++) {
      let bad = 0, tot = 0;
      for (let j = 0; j < RH; j++)
        for (let i = 0; i < RW; i++) {
          const ry = RY + j + dy, rx = RX + i + dx;
          const sy = j, sx = i;
          if (sy >= shot.height || sx >= shot.width) continue;
          const si = (sy * shot.width + sx) * 4, ri = (ry * ref.width + rx) * 4;
          tot++;
          const la = (shot.data[si] + shot.data[si + 1] + shot.data[si + 2]) / 3 > 110;
          const lb = (ref.data[ri] + ref.data[ri + 1] + ref.data[ri + 2]) / 3 > 110;
          if (la !== lb) bad++;
        }
      if (!best || bad < best.bad) best = { dx, dy, bad, tot };
    }
  results.push([fam, size, weight, best]);
}
results.sort((a, b) => a[3].bad - b[3].bad);
for (const [fam, size, weight, b] of results.slice(0, 10))
  console.log(`${fam} ${size}px w${weight}: bad=${((b.bad / b.tot) * 100).toFixed(1)}% dx=${b.dx} dy=${b.dy}`);
await browser.close();
