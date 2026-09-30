// 字体匹配测试：渲染候选字体，测量 "2392" 宽（目标 advance=8 → 宽32）与 cap 高（目标≈11）
import { chromium } from "playwright";

const candidates = [
  ["Consolas", 12], ["Consolas", 13], ["Consolas", 14], ["Consolas", 15], ["Consolas", 16],
  ["Courier New", 13], ["Courier New", 14], ["Courier New", 16],
  ["Lucida Console", 12], ["Lucida Console", 13], ["Lucida Console", 14],
  ["Cascadia Mono", 13], ["Cascadia Mono", 14], ["Cascadia Mono", 15],
  ["JetBrains Mono", 13], ["JetBrains Mono", 14],
  ["Sarasa Fixed SC", 14], ["Iosevka", 14],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 1200 } });
await page.setContent(
  `<body style="margin:0;background:#1c1c1c">${candidates
    .map(
      ([f, s], i) =>
        `<div id="c${i}" style="font-family:'${f}',monospace;font-size:${s}px;color:#ececec;white-space:pre">2392</div>`,
    )
    .join("")}</body>`,
  { waitUntil: "networkidle" },
);

const results = await page.evaluate((cands) => {
  return cands.map(([f, s], i) => {
    const el = document.getElementById("c" + i);
    const cv = document.createElement("canvas").getContext("2d");
    cv.font = `${s}px '${f}', monospace`;
    const w4 = cv.measureText("2392").width;
    // cap 高：渲染到 canvas 测像素
    const cv2 = document.createElement("canvas");
    cv2.width = 60; cv2.height = 30;
    const c2 = cv2.getContext("2d");
    c2.font = `${s}px '${f}', monospace`;
    c2.fillStyle = "#fff";
    c2.textBaseline = "top";
    c2.fillText("2", 2, 2);
    const img = c2.getImageData(0, 0, 60, 30).data;
    let top = -1, bot = -1;
    for (let y = 0; y < 30; y++) for (let x = 0; x < 60; x++) {
      if (img[(y * 60 + x) * 4 + 3] > 100) { if (top < 0) top = y; bot = y; break; }
    }
    return { f, s, w4: +w4.toFixed(2), cap: bot - top + 1 };
  });
}, candidates);

for (const r of results)
  console.log(`${r.f.padEnd(16)} ${String(r.s).padStart(2)}px  "2392"宽=${r.w4} cap=${r.cap}  (目标 32 / 11)`);
await browser.close();
