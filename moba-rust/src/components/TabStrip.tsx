// 标签栏：24px 高，底 1px #6a6a6a（ref 实测）
// 快速连接框 x1-238；主页签梯形 x244-300（sprite）；活动标签 x292-541 斜边 10px/22；
// 小钥匙框 x302；文本 x323 #54a0dc；X x512；加号按钮 x536（sprite）。
import hometab from "../assets/sprites/hometab.png";
import plusbtn from "../assets/sprites/plusbtn.png";
import keyboxSm from "../assets/sprites/keybox-sm.png";

export type View = "home" | "terminal";

interface Props {
  active: View;
  onChange: (view: View) => void;
}

const FONT = "Tahoma, 'Segoe UI', sans-serif";

export default function TabStrip({ active, onChange }: Props) {
  return (
    <div
      className="relative h-[24px] shrink-0"
      style={{ background: "#141414", borderBottom: "1px solid #6a6a6a" }}
    >
      {/* 快速连接框 */}
      <div
        className="absolute"
        style={{ left: 1, top: 0, width: 237, height: 22, border: "1px solid #6a6a6a", background: "#141414" }}
      />
      <span
        className="absolute whitespace-nowrap text-[12px]"
        style={{ left: 13, top: 3, color: "#d3d3d3", fontFamily: FONT }}
      >
        快速连接...
      </span>

      {/* 主页签（梯形 + 图标 sprite） */}
      <button
        className="absolute"
        style={{ left: 244, top: 1, width: 57, height: 22, padding: 0, border: "none", background: "transparent" }}
        onClick={() => onChange("home")}
        aria-label="首页"
      >
        <img src={hometab} alt="" style={{ width: 57, height: 22 }} />
      </button>

      {/* 活动标签（斜边梯形） */}
      <button
        className="absolute"
        style={{
          left: 292,
          top: 1,
          width: 249,
          height: 22,
          padding: 0,
          border: "none",
          background: active === "terminal" ? "#1e1e1e" : "#545454",
          clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
        }}
        onClick={() => onChange("terminal")}
        aria-label="终端标签"
      />
      <img src={keyboxSm} alt="" className="pointer-events-none absolute" style={{ left: 302, top: 6, width: 16, height: 13 }} />
      <span
        className="pointer-events-none absolute whitespace-nowrap text-[12px]"
        style={{ left: 323, top: 6, color: "#54a0dc", fontFamily: FONT }}
      >
        2. 192.168.98.130 (root)
      </span>
      <svg className="pointer-events-none absolute" style={{ left: 511, top: 7 }} width="7" height="7" viewBox="0 0 7 7">
        <path d="M1 1 L6 6 M6 1 L1 6" stroke="#a2a2a2" strokeWidth="1.3" />
      </svg>

      {/* 加号按钮 */}
      <img src={plusbtn} alt="" className="pointer-events-none absolute" style={{ left: 536, top: 0, width: 34, height: 23 }} />
    </div>
  );
}
