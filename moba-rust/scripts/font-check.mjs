// 检查浏览器实际渲染字体与 "2392" 宽
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(
  '<div id="t" style="font-family:SF Mono,Menlo,Consolas,monospace;font-size:12px;letter-spacing:0.13px">2392</div>',
);
const r = await page.evaluate(() => {
  const el = document.getElementById("t");
  const cs = getComputedStyle(el);
  const cv = document.createElement("canvas").getContext("2d");
  cv.font = cs.font;
  return {
    family: cs.fontFamily,
    size: cs.fontSize,
    w4: cv.measureText("2392").width,
    rect: el.getBoundingClientRect().width,
  };
});
console.log(r);
await browser.close();
