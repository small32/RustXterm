// Phase 1：静态 UI 复刻（主界面 + 终端界面）
// 布局按 pixel-spec §8 macOS 分带：让位区 28 + 图标行 32 + 文字行 27 + 标签栏 24 = 111px chrome
// 所有颜色走 token 层（index.css），深色为默认主题。
// 标签栏点击可在"首页"与"终端"两个静态视图间切换。
import { useState } from "react";
import Toolbar from "./components/Toolbar";
import TabStrip from "./components/TabStrip";
import type { View } from "./components/TabStrip";
import SessionTree from "./components/SessionTree";
import HomePage from "./components/HomePage";
import TerminalLayout from "./components/TerminalLayout";

export default function App() {
  const [view, setView] = useState<View>("home");

  return (
    <div
      data-theme="dark"
      className="flex h-screen w-screen flex-col font-sans"
      style={{ background: "var(--bg-main)" }}
    >
      {/* macOS 原生标题栏让位区（交通灯浮于其上，约 28px） */}
      <div
        className="h-[28px] shrink-0"
        style={{ background: "var(--bg-titlebar)" }}
      />
      <Toolbar />
      <TabStrip active={view} onChange={setView} />
      {/* 内容区：首页视图 = 会话树 + 首页；终端视图 = SFTP 面板 + 终端（截图 2 左侧为 SFTP） */}
      <div className="flex min-h-0 flex-1">
        {view === "home" ? (
          <>
            <SessionTree />
            <HomePage />
          </>
        ) : (
          <TerminalLayout />
        )}
      </div>
      {/* 底部边框线 1px（截图 y=1039） */}
      <div className="h-[1px] shrink-0" style={{ background: "var(--border)" }} />
    </div>
  );
}
