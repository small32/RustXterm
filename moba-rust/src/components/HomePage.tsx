// 首页区（pixel-spec §4.6，内容读自截图）
// 按钮：Start local terminal（199px）/ 恢复先前的会话（215px），高 31 + 上下 1px 边框。
// 搜索框 403×24；"最近的会话" 3 列网格（列距 187，行距 24）。
// Logo 原图为 MobaXterm 标识，按项目要求替换为 MobaRust 品牌（终端图标 + 彩色方块 + 文字）。
import { CirclePlus, RotateCw, KeyRound, Terminal } from "lucide-react";

const recentSessions = [
  "192.168.98.130 (root)",
  "Ni1_Lan",
  "c.small32.top (root)",
  "d.small32.top (root)",
  "Dmit-A",
  "N1",
];

export default function HomePage() {
  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{ background: "var(--bg-main)" }}
    >
      {/* Logo（262×46 区域，水平居中） */}
      <div className="absolute left-1/2 top-[35%] flex h-[46px] w-[262px] -translate-x-1/2 items-center justify-center gap-[10px]">
        <div
          className="flex h-[40px] w-[46px] items-center justify-center"
          style={{ border: "2px solid #d9d9d9" }}
        >
          <Terminal size={20} style={{ color: "#d9d9d9" }} />
        </div>
        <div className="relative h-[34px] w-[34px]">
          <div
            className="absolute left-0 top-[6px] h-[22px] w-[22px] rotate-12"
            style={{ background: "#f34134" }}
          />
          <div
            className="absolute left-[10px] top-0 h-[22px] w-[22px] -rotate-6"
            style={{ background: "#1d94f3" }}
          />
          <div
            className="absolute left-[6px] top-[12px] h-[22px] w-[22px] rotate-45"
            style={{ background: "#49ae4e" }}
          />
        </div>
        <span
          className="text-[30px] font-medium tracking-[1px]"
          style={{ color: "#ececec" }}
        >
          MobaRust
        </span>
      </div>

      {/* 双按钮 */}
      <div className="absolute left-1/2 top-[42.3%] flex -translate-x-1/2 gap-[90px]">
        <button
          className="flex h-[33px] w-[199px] items-center justify-center gap-[8px] border-y text-[13px]"
          style={{
            background: "var(--fill-button)",
            borderColor: "var(--border)",
            color: "var(--text-main)",
          }}
        >
          <CirclePlus size={15} style={{ color: "#49ae4e" }} />
          Start local terminal
        </button>
        <button
          className="flex h-[33px] w-[215px] items-center justify-center gap-[8px] border-y text-[13px]"
          style={{
            background: "var(--fill-button)",
            borderColor: "var(--border)",
            color: "var(--text-main)",
          }}
        >
          <RotateCw size={15} style={{ color: "#00bbd5" }} />
          恢复先前的会话
        </button>
      </div>

      {/* 搜索框 403×24 */}
      <div className="absolute left-1/2 top-[47.5%] -translate-x-1/2">
        <div
          className="flex h-[24px] w-[403px] items-center px-[8px]"
          style={{
            border: "1px solid var(--border-search)",
            background: "var(--bg-main)",
          }}
        >
          <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            查找现有会话或服务器名...
          </span>
        </div>
      </div>

      {/* "最近的会话"标题 */}
      <div
        className="absolute left-1/2 top-[55.9%] -translate-x-1/2 text-[12px]"
        style={{ color: "var(--text-main)" }}
      >
        最近的会话
      </div>

      {/* 最近会话网格：3 列，列距 187，行距 24 */}
      <div className="absolute left-1/2 top-[58.4%] grid w-[561px] -translate-x-1/2 grid-cols-3">
        {recentSessions.map((name) => (
          <div key={name} className="flex h-[24px] items-center">
            <KeyRound size={14} style={{ color: "#ffc71d" }} fill="#ffc71d" />
            <span className="ml-[6px] text-[12px]" style={{ color: "var(--text-main)" }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
