// tabstrip 字体互相关：tab 文本 + 快速连接文本
import { chromium } from "playwright";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const ATTACH = "c:\\Users\\Small32\\.trae-cn\\attachments\\6ab8b12dfd65081d0a6e0461";
const ref = PNG.sync.read(
  fs.readFileSync(path.join(ATTACH, "002fbac9-5ce4-462b-a4a7-e84e1db6a380_8207c50c-5d49-4ffd-ae7e-e2130c5e31bf_image.png")),
);

const REGIONS = [
  { text: "2. 192.168.98.130 (root)", x: 321, y: 107, w: 119, h: 10, color: "#54a0dc" },
  { text: "快速连接...", x: 13, y: 103, w: 76, h: 13, color: "#d3d3d3" },
];

const fams = ["Tahoma", "Segoe UI", "Arial", "Verdana", "Consolas", "Meiryo", "Microsoft YaHei", "SimSun", "NSimSun", "Trebuchet MS", "Lucida Sans", "Segoe UI Semilight", "DengXian", "KaiTi", "FangSong"];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 300, height: 30 } });

const ONLY = process.env.ONLY; // 过滤字体名
for (const R of REGIONS) {
  const results = [];
  for (const fam of fams.filter((f) => !ONLY || f.includes(ONLY)))
    for (let size = 9; size <= 16; size += 0.5) {
      await page.setContent(
        `<body style="margin:0;background:#141414"><div id="t" style="font-family:'${fam}';font-size:${size}px;line-height:${R.h + 4}px;color:${R.color};white-space:pre">${R.text}</div></body>`,
      );
      await page.waitForTimeout(12);
      const shot = PNG.sync.read(await page.locator("#t").screenshot());
      let best = null;
      for (let dy = -5; dy <= 5; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          let bad = 0, tot = 0;
          for (let j = 0; j < R.h; j++)
            for (let i = 0; i < R.w; i++) {
              const sy = j - dy, sx = i - dx;
              if (sy < 0 || sy >= shot.height || sx < 0 || sx >= shot.width) continue;
              const si = (sy * shot.width + sx) * 4;
              const ri = ((R.y + j) * ref.width + (R.x + i)) * 4;
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
  console.log(`== "${R.text}" ==`);
  for (const [fam, size, b] of results.slice(0, 6))
    console.log(`${fam} ${size}px: bad=${((b.bad / b.tot) * 100).toFixed(1)}% dx=${b.dx} dy=${b.dy}`);
}
await browser.close();
