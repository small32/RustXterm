// sidebar 字体匹配：渲染 5 串文本测宽，对比 ref bbox 宽 64/25/72/136/25
import { chromium } from "playwright";

const STRINGS = ["User sessions", "SDFE", "10.0.0.1 (root)", "103.136.127.158 (root)", "Test"];
const TARGET = [64, 25, 72, 136, 25];

const browser = await chromium.launch();
const page = await browser.newPage();
const fams = ["Segoe UI", "system-ui", "Tahoma", "Verdana", "Arial", "Helvetica Neue", "MS Shell Dlg 2", "Yu Gothic UI"];
const results = [];
for (const fam of fams)
  for (const size of [11, 11.5, 12, 12.5, 13, 13.5, 14]) {
    await page.setContent(
      `<body style="margin:0">${STRINGS.map(
        (s, i) => `<span id="t${i}" style="font-family:'${fam}';font-size:${size}px;white-space:pre">${s}</span>`,
      ).join("")}</body>`,
    );
    const widths = await page.evaluate((n) =>
      Array.from({ length: n }, (_, i) => document.getElementById(`t${i}`).getBoundingClientRect().width),
      STRINGS.length,
    );
    const err = widths.reduce((a, w, i) => a + Math.abs(Math.round(w) - TARGET[i]), 0);
    results.push([fam, size, err, widths.map((w) => Math.round(w))]);
  }
results.sort((a, b) => a[2] - b[2]);
for (const [fam, size, err, w] of results.slice(0, 12))
  console.log(`${fam} ${size}px err=${err.toFixed(1)} widths=${w.join("/")}`);
await browser.close();
