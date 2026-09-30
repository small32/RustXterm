// tabstrip 字体 ink 量化：目标 refTerm 630 / refHome 3206（区域 150x22）
import { chromium } from "playwright";
import { PNG } from "pngjs";

const TEXT = "2. 192.168.98.130 (root)";
const cands = [
  ["Meiryo", 10.5],
  ["Segoe UI Semilight", 10.5],
  ["Segoe UI", 10.5],
  ["Segoe UI Light", 10.5],
  ["Tahoma", 10.5],
  ["Lucida Sans", 10.5],
  ["Microsoft YaHei Light", 10.5],
  ["Microsoft YaHei", 10.5],
];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 200, height: 30 } });
for (const [fam, size] of cands) {
  await page.setContent(
    `<body style="margin:0;background:#545454"><div id="t" style="font-family:'${fam}';font-size:${size}px;line-height:22px;color:#54a0dc;white-space:pre">${TEXT}</div></body>`,
  );
  await page.waitForTimeout(15);
  const shot = PNG.sync.read(await page.locator("#t").screenshot());
  let ink = 0;
  for (let i = 0; i < shot.width * shot.height; i++) {
    const d = Math.abs(shot.data[i * 4] - 84) + Math.abs(shot.data[i * 4 + 1] - 84) + Math.abs(shot.data[i * 4 + 2] - 84);
    if (d > 90) ink++;
  }
  console.log(`${fam} ${size}px ink=${ink}`);
}
await browser.close();
